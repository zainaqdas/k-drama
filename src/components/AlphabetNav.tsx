import Link from 'next/link';

interface AlphabetNavProps {
  currentLetter: string;
  basePath?: string;
}

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function AlphabetNav({
  currentLetter,
  basePath = '/drama-list',
}: AlphabetNavProps) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {letters.map((letter) => {
        const isActive = letter === currentLetter;
        return (
          <Link
            key={letter}
            href={`${basePath}/${letter}`}
            className={`
              w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-all
              ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                  : 'bg-surface-light text-gray-400 hover:bg-surface-lighter hover:text-emerald-400'
              }
            `}
          >
            {letter.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
