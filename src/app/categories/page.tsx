import { getCategories } from '@/lib/server-data';
import Link from 'next/link';
import { Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Browse Categories — WaveDrama',
  description: 'Browse Asian dramas by category including K-Drama, Chinese Drama, Japanese Drama, and more.',
};

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let error = false;

  try {
    categories = await getCategories();
  } catch {
    error = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-400 text-xs font-medium mb-4">
          <Layers className="w-3.5 h-3.5" />
          Categories
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2">
          Browse Categories
        </h1>
        <p className="text-gray-400 text-sm">
          Explore dramas by region and type
        </p>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Could not load categories.</p>
          <Link href="/" className="btn-primary inline-block mt-4">Go Home</Link>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No categories available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group flex items-center justify-between p-4 rounded-xl bg-surface border border-white/5 hover:border-emerald-500/30 transition-all card-hover"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200 group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-500">{cat.count} titles</p>
                </div>
              </div>
              <Layers className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
