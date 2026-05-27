// NOTE: Dramacool uses many domains that change frequently.
// Currently active: dramacoolw.top (as of May 2026)
// Check the redirect chain if scraping stops working.
export const BASE_URL = 'https://dramacoolw.top';
export const WP_API = `${BASE_URL}/wp-json/wp/v2`;

export const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const REQUEST_TIMEOUT = 30000;
export const PORT = process.env.PORT || 3001;
