import { notFound } from 'next/navigation';
import { getDrill } from '../../../lib/drills';
import DrillSession from './session';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const drill = await getDrill((await params).id);

  return {
    title: drill
      ? `${drill.title} — Mojo`
      : 'Latihan tidak ditemukan — Mojo',
  };
}

export default async function DrillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const drill = await getDrill((await params).id);

  if (!drill) {
    notFound();
  }

  return <DrillSession key={drill.id} drill={drill} />;
}