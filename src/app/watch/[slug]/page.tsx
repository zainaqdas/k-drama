import { getEpisodePage } from '@/lib/api';
import WatchClient from './WatchClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const data = await getEpisodePage(slug);
    return {
      title: `Watch ${data.title} — WaveDrama`,
      description: `Watch ${data.title} online free in HD on WaveDrama.`,
    };
  } catch {
    return {
      title: 'Watch Episode — WaveDrama',
    };
  }
}

export default async function WatchPage({ params }: Props) {
  const { slug } = await params;
  return <WatchClient slug={slug} />;
}
