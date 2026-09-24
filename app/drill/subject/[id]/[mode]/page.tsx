import {notFound} from 'next/navigation';
import {getDrills} from '../../../../../lib/drills';
import {drillSubjects, drillModes, overallDrill} from '../../../../../lib/drill-catalog';
import DrillSession from '../../../[id]/session';
import {relaxedDrill} from '../../../../../lib/relaxed-questions';

export const dynamic = 'force-dynamic';
export default async function SubjectTest({params, searchParams}: {
  params: Promise<{id: string; mode: string}>;
  searchParams: Promise<{skill?: string | string[]}>;
}) {
  const {id, mode} = await params;
  const {skill} = await searchParams;
  if (!drillSubjects.some(subject => subject.id === id) || !drillModes.some(item => item.id === mode) || Array.isArray(skill)) notFound();
  const drill = mode === 'quick' ? relaxedDrill(id, skill) : overallDrill(await getDrills(), id, mode, skill);
  if (!drill) notFound();
  return <DrillSession key={drill.id} drill={drill} recordAttempt={false}/>;
}
