import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse-glow">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
      <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
    </div>
  );
}
