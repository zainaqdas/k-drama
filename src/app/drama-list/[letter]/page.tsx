import { getDramaList } from '@/lib/api';
import DramaCard from '@/components/DramaCard';
import AlphabetNav from '@/components/AlphabetNav';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ letter: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { letter } = await params;
  return {
    title: `Dramas Starting with ${letter.toUpperCase()} — WaveDrama`,
    description: `Browse Asian dramas starting with the letter ${letter.toUpperCase()} on WaveDrama.`,
  };
}

export default async function DramaListPage({ params, searchParams }: Props) {
  const { letter } = await params;
  const pageParam = searchParams ? await searchParams : undefined;
  const page = Number(pageParam?.page) || 1;
  const cleanLetter = letter.toLowerCase();

  if (!/^[a-z]$/.test(cleanLetter)) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-10 h-10 text-gray-600" />
        <p className="text-gray-500">Invalid letter. Choose a letter from A to Z.</p>
        <AlphabetNav currentLetter="a" />
      </div>
    );
  }

  let data: Awaited<ReturnType<typeof getDramaList>> | null = null;
  let error = false;

  try {
    data = await getDramaList(cleanLetter, page);
  } catch {
    error = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-xs font-medium mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          Drama List
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-4">
          Dramas Starting with &ldquo;{cleanLetter.toUpperCase()}&rdquo;
        </h1>

        {/* Alphabet Nav */}
        <AlphabetNav currentLetter={cleanLetter} />
      </div>

      {error ? (
        <div className="text-center py-12 text-gray-500">
          Could not load drama list. Make sure the API server is running.
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <p className="text-sm text-gray-400 mb-4">
            Showing {data.items.length} dramas
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {data.items.map((item, i) => (
              <DramaCard key={i} item={item} index={i} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-3 mt-10">
            {page > 1 && (
              <Link
                href={`/drama-list/${cleanLetter}?page=${page - 1}`}
                className="btn-outline text-sm"
              >
                Previous Page
              </Link>
            )}
            {data.items.length >= 20 && (
              <Link
                href={`/drama-list/${cleanLetter}?page=${page + 1}`}
                className="btn-primary text-sm"
              >
                Next Page
              </Link>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No dramas found starting with &ldquo;{cleanLetter.toUpperCase()}&rdquo;.
        </div>
      )}
    </div>
  );
}
