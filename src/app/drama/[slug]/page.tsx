import { getDramaDetail } from '@/lib/server-data';
import DramaDetailClient from './DramaDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const data = await getDramaDetail(slug);
    return {
      title: `${data.title} — WaveDrama`,
      description: data.description?.slice(0, 160) || `Watch ${data.title} online free on WaveDrama.`,
    };
  } catch {
    return {
      title: 'Drama Detail — WaveDrama',
    };
  }
}

export default async function DramaDetailPage({ params }: Props) {
  const { slug } = await params;
  return <DramaDetailClient slug={slug} />;
}
