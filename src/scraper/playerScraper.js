import { BASE_URL, USER_AGENT } from './config.js';

// ---------------------------------------------------------------------------
// Puppeteer is optional — it may not be available on serverless platforms
// like Vercel. We use a dynamic import so the module doesn't crash at load
// time if puppeteer isn't installed.
// ---------------------------------------------------------------------------
async function getPuppeteer() {
  try {
    const mod = await import('puppeteer');
    return mod.default;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Extract video sources from a page using Puppeteer.
//
// Strategies:
//   1. Look for <video> / <source> tags
//   2. Look for <iframe> pointing to video hosts
//   3. Decode common JS-obfuscated video URLs
//   4. Inspect network requests for .m3u8 / .mp4
//   5. Click server buttons to trigger iframe/video load
// ---------------------------------------------------------------------------

/**
 * Scrape an episode page for video stream URLs.
 *
 * @param {string}  episodeSlug   e.g. "daughter-of-fortune-2026-episode-19"
 * @param {object}  [opts]
 * @param {number}  [opts.waitMs=8000]    Time to wait for JS to execute after page load
 * @param {number}  [opts.clickWaitMs=3000]  Time to wait after clicking a server button
 * @param {boolean} [opts.headless=true]  Run browser headless
 * @returns {Promise<object>} video sources and metadata
 */
export async function scrapeVideoUrls(episodeSlug, opts = {}) {
  const { waitMs = 8000, clickWaitMs = 3000, headless = true } = opts;
  const url = `${BASE_URL}/${episodeSlug}/`;

  const puppeteer = await getPuppeteer();
  if (!puppeteer) {
    return {
      pageUrl: url,
      note: 'Puppeteer is not available on this platform (e.g. Vercel serverless). Video extraction requires a Node.js environment with Chromium.',
      videoSources: [], iframes: [], videoHosts: [], networkVideoUrls: [], serversClicked: [],
    };
  }

  const browser = await puppeteer.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1366, height: 768 });

    // Block images/fonts for speed – but NOT media (we want to capture video streams)
    await page.setRequestInterception(true);
    const networkLog = [];
    page.on('request', (req) => {
      const type = req.resourceType();
      if (type === 'image' || type === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Capture network responses containing video URLs
    page.on('response', (res) => {
      const ct = (res.headers()['content-type'] || '').toLowerCase();
      const url = res.url();
      if (
        url.includes('.m3u8') ||
        url.includes('.mp4') ||
        url.includes('.ts') ||
        url.includes('videoplayback') ||
        url.includes('manifest') ||
        url.includes('master.m3u8') ||
        ct.includes('video') ||
        ct.includes('application/vnd.apple.mpegurl') ||
        ct.includes('application/x-mpegurl') ||
        ct.includes('octet-stream')
      ) {
        networkLog.push({ url, contentType: ct });
      }
    });

    // Navigate to the episode page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate((ms) => new Promise((r) => setTimeout(r, ms)), waitMs);

    // ---------------------------------------------------------------
    // Strategy 1: Direct <video> / <source> elements
    // ---------------------------------------------------------------
    const videoSources = await page.evaluate(() => {
      const sources = [];
      document.querySelectorAll('video source, video').forEach((el) => {
        const src = el.getAttribute('src') || el.currentSrc || '';
        if (src) sources.push({ src, type: el.getAttribute('type') || 'video/mp4' });
      });
      return sources;
    });

    // ---------------------------------------------------------------
    // Strategy 2: <iframe> embeds (most common pattern on these sites)
    // ---------------------------------------------------------------
    const iframes = await page.evaluate(() => {
      const frames = [];
      document.querySelectorAll('iframe').forEach((el) => {
        frames.push({
          src: el.getAttribute('src') || '',
          id: el.id || '',
          className: el.className || '',
        });
      });
      return frames;
    });

    // ---------------------------------------------------------------
    // Strategy 3: JS variables / embedded JSON
    // ---------------------------------------------------------------
    const jsVars = await page.evaluate(() => {
      const vars = {};
      if (window.videoUrl) vars.videoUrl = window.videoUrl;
      if (window.video_link) vars.video_link = window.video_link;
      if (window.playerData) vars.playerData = JSON.stringify(window.playerData);
      if (window.ep_data) vars.ep_data = JSON.stringify(window.ep_data);
      if (window.dramacool) vars.dramacool = JSON.stringify(window.dramacool);
      document.querySelectorAll('script[type="application/json"]').forEach((el) => {
        try {
          const parsed = JSON.parse(el.textContent);
          vars[`script_json_${el.id || 'unnamed'}`] = JSON.stringify(parsed);
        } catch { /* ignore */ }
      });
      return vars;
    });

    // ---------------------------------------------------------------
    // Strategy 4: Identify video hosts from iframe sources
    // ---------------------------------------------------------------
    const videoHosts = [];
    for (const iframe of iframes) {
      const src = iframe.src;
      const hostMatch = src.match(/https?:\/\/([^/]+)/);
      if (hostMatch) {
        videoHosts.push({ host: hostMatch[1], embedUrl: src });
      }
    }

    // ---------------------------------------------------------------
    // Strategy 5: Decode JS obfuscation patterns
    // ---------------------------------------------------------------
    const obfuscatedData = await page.evaluate(() => {
      const found = {};
      document.querySelectorAll('script').forEach((el) => {
        const text = el.textContent || '';
        const atobMatch = text.match(/atob\(['"]([A-Za-z0-9+/=]{20,})['"]\)/);
        if (atobMatch) {
          try { found.atob_decoded = atob(atobMatch[1]); } catch { /* ignore */ }
        }
        const playerSrcMatch = text.match(/playerSrc\s*=\s*['"]([^'"]+)['"]/);
        if (playerSrcMatch) found.playerSrc = playerSrcMatch[1];
        const videoUrlMatch = text.match(/videoUrl\s*=\s*['"]([^'"]+)['"]/);
        if (videoUrlMatch) found.videoUrlMatch = videoUrlMatch[1];
        const linkMatch = text.match(/link\s*:\s*['"]([^'"]+)['"]/);
        if (linkMatch) found.linkVar = linkMatch[1];
      });
      return found;
    });

    // ---------------------------------------------------------------
    // Strategy 6: Click server buttons to trigger iframe/video load
    // ---------------------------------------------------------------
    const serversClicked = [];
    const serverButtons = await page.$$(
      '.server-list a, .server-option a, .watch-server a, .server-item a, [data-server]'
    );
    for (const btn of serverButtons.slice(0, 5)) {
      try {
        const text = await page.evaluate((el) => el.textContent.trim(), btn);
        await btn.click();
        serversClicked.push(text);

        // Wait for new iframes or video elements to load
        await page.evaluate((ms) => new Promise((r) => setTimeout(r, ms)), clickWaitMs);

        // Try waiting for an iframe specifically
        try {
          await page.waitForSelector('iframe', { timeout: 2000 });
        } catch { /* no new iframe appeared */ }

        // Check for new video sources
        const newSources = await page.evaluate(() => {
          const s = [];
          document.querySelectorAll('video source, video').forEach((el) => {
            const src = el.getAttribute('src') || el.currentSrc || '';
            if (src) s.push({ src, type: el.getAttribute('type') || 'video/mp4' });
          });
          return s;
        });
        if (newSources.length) videoSources.push(...newSources);

        // Check for new iframes
        const newIframes = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('iframe')).map((el) => ({
            src: el.getAttribute('src') || '',
            id: el.id || '',
            className: el.className || '',
          }));
        });
        iframes.push(...newIframes);
      } catch { /* ignore click errors */ }
    }

    // ---------------------------------------------------------------
    // Compile results
    // ---------------------------------------------------------------
    const result = {
      pageUrl: url,
      title: await page.title(),
      videoSources: videoSources.filter((v) => v.src),
      iframes: iframes.filter((f) => f.src),
      videoHosts: [...new Map(videoHosts.map((v) => [v.embedUrl, v])).values()],
      networkVideoUrls: [...new Map(networkLog.map((n) => [n.url, n])).values()],
      jsVariables: Object.keys(jsVars).length ? jsVars : undefined,
      obfuscatedData: Object.keys(obfuscatedData).length ? obfuscatedData : undefined,
      serversClicked,
    };

    return result;
  } finally {
    await browser.close();
  }
}

/**
 * Follow an iframe embed URL to extract the actual video source.
 * Useful for sites like Fembed, Mixdrop, Streamtape, etc.
 */
export async function scrapeEmbedUrl(embedUrl) {
  const puppeteer = await getPuppeteer();
  if (!puppeteer) {
    return { embedUrl, note: 'Puppeteer not available on this platform', videoSources: [], networkUrls: [] };
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);

    const networkLog = [];
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image' || req.resourceType() === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('.m3u8') || url.includes('.mp4') || url.includes('videoplayback')) {
        networkLog.push({ url, type: res.resourceType() });
      }
    });

    await page.goto(embedUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => new Promise((r) => setTimeout(r, 5000)));

    const videoSources = await page.evaluate(() => {
      const sources = [];
      document.querySelectorAll('video source, video').forEach((el) => {
        const src = el.getAttribute('src') || el.currentSrc || '';
        if (src) sources.push({ src, type: el.getAttribute('type') || '' });
      });
      return sources;
    });

    return { embedUrl, videoSources, networkUrls: [...new Map(networkLog.map((n) => [n.url, n])).values()] };
  } finally {
    await browser.close();
  }
}
