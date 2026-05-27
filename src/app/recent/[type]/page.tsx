import { getRecentlyAdded } from '@/lib/api';
import DramaCard from '@/components/DramaCard';
import Link from 'next/link';
import { Film, Tv, Monitor, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ type: string }>;
  searchParams?: Promise<{ page?: string }>;
}

const typeConfig: Record<string, { title: string; icon: React.ReactNode }> = {
  drama: { title: 'Recent Dramas', icon: <Tv className="w-5 h-5" /> },
  movie: { title: 'Recent Movies', icon: <Film className="w-5 h-5" /> },
  kshow: { title: 'Recent K-Shows', icon: <Monitor className="w-5 h-5" /> },
};

export async function generateMetadata({ params }: Props) {
  const { type } = await params;
  const config = typeConfig[type] || typeConfig.drama;
  return {
    title: `${config.title} — WaveDrama`,
    description: `Browse recently added ${type}s on WaveDrama.`,
  };
}

export default async function RecentPage({ params, searchParams }: Props) {
  const { type } = await params;
  const pageParam = searchParams ? await searchParams : undefined;
  const page = Number(pageParam?.page) || 1;
  const config = typeConfig[type] || typeConfig.drama;

  let data: Awaited<ReturnType<typeof getRecentlyAdded>> | null = null;
  let error = false;

  try {
    data = await getRecentlyAdded(type, page);
  } catch {
    error = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="text-emerald-400">{config.icon}</div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{config.title}</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-1">Page {page}</p>
          )}
        </div>
      </div>

      {error ? (
        <div className="text-center py-12 text-gray-500">
          Could not load content. Make sure the API server is running.
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {data.items.map((item, i) => (
              <DramaCard key={i} item={item} index={i} />
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-10">
            {page > 1 && (
              <Link href={`/recent/${type}?page=${page - 1}`} className="btn-outline text-sm">
                Previous Page
              </Link>
            )}
            {data.items.length >= 20 && (
              <Link href={`/recent/${type}?page=${page + 1}`} className="btn-primary text-sm">
                Next Page
              </Link>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No content available.
        </div>
      )}
    </div>
  );
}
