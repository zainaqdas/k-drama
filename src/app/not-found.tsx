import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-7xl font-bold text-gradient">404</div>
      <h1 className="text-xl font-semibold text-gray-300">Page Not Found</h1>
      <p className="text-sm text-gray-500 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3 mt-2">
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" />
          Home
        </Link>
        <Link href="/search" className="btn-outline inline-flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search
        </Link>
      </div>
    </div>
  );
}
