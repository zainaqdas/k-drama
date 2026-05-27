import { getHomepage } from '@/lib/api';
import HeroSection from '@/components/HeroSection';
import DramaCard from '@/components/DramaCard';
import Link from 'next/link';
import { ChevronRight, Film, Tv, Monitor, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let homepageData;
  let error = false;

  try {
    homepageData = await getHomepage();
  } catch {
    error = true;
  }

  if (error || !homepageData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 bg-surface rounded-2xl flex items-center justify-center">
          <Film className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-300">Could not load content</h2>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Unable to fetch data from the streaming source. The external site may be temporarily unavailable or the domain may need updating.
        </p>
      </div>
    );
  }

  const sections: { title: string; icon: React.ReactNode; items: typeof homepageData.recentDrama; link?: string }[] = [
    {
      title: 'Recent Dramas',
      icon: <Tv className="w-5 h-5" />,
      items: homepageData.recentDrama,
      link: '/recent/drama',
    },
    {
      title: 'Recent Movies',
      icon: <Film className="w-5 h-5" />,
      items: homepageData.recentMovie,
      link: '/recent/movie',
    },
    {
      title: 'K-Shows',
      icon: <Monitor className="w-5 h-5" />,
      items: homepageData.recentKshow,
      link: '/recent/kshow',
    },
  ];

  return (
    <>
      {/* Hero */}
      <HeroSection data={homepageData} />

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 space-y-10 pb-16">
        {sections.map(
          (section) =>
            section.items.length > 0 && (
              <section key={section.title}>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="text-emerald-400">{section.icon}</div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {section.title}
                    </h2>
                  </div>
                  {section.link && (
                    <Link
                      href={section.link}
                      className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {section.items.slice(0, 12).map((item, i) => (
                    <DramaCard key={`${section.title}-${i}`} item={item} index={i} />
                  ))}
                </div>
              </section>
            )
        )}

        {/* Coming episodes */}
        {homepageData.comingEps && homepageData.comingEps.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Coming Episodes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {homepageData.comingEps.map((ep, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/5 hover:border-emerald-500/20 transition-all card-hover"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-emerald-400">{i + 1}</span>
                  </div>
                  <span className="text-sm text-gray-300 line-clamp-1">{ep.title}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Section */}
        {homepageData.popular && homepageData.popular.length > 0 && (
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Popular</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {homepageData.popular.map((item, i) => (
                <DramaCard key={`popular-${i}`} item={item} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
