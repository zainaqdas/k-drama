import { getCategoryPage } from '@/lib/server-data';
import DramaCard from '@/components/DramaCard';
import Link from 'next/link';
import { ChevronLeft, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} — WaveDrama`,
    description: `Browse ${slug.replace(/-/g, ' ')} on WaveDrama. Watch free online.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const pageParam = searchParams ? await searchParams : undefined;
  const page = Number(pageParam?.page) || 1;

  let data: Awaited<ReturnType<typeof getCategoryPage>> | null = null;
  let error = false;

  try {
    data = await getCategoryPage(slug, page);
  } catch {
    error = true;
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Layers className="w-10 h-10 text-gray-600" />
        <p className="text-gray-500">Could not load this category</p>
        <Link href="/categories" className="btn-primary">Browse Categories</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/categories" className="text-gray-400 hover:text-emerald-400 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white capitalize">
              {slug.replace(/-/g, ' ')}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Page {data.page} &middot; {data.items.length} titles
          </p>
        </div>
      </div>

      {data.items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {data.items.map((item, i) => (
            <DramaCard key={i} item={item} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No titles found.</div>
      )}

      <div className="flex justify-center gap-3 mt-10">
        {page > 1 && (
          <Link href={`/category/${slug}?page=${page - 1}`} className="btn-outline text-sm">
            Previous Page
          </Link>
        )}
        {data.items.length >= 20 && (
          <Link href={`/category/${slug}?page=${page + 1}`} className="btn-primary text-sm">
            Next Page
          </Link>
        )}
      </div>
    </div>
  );
}
