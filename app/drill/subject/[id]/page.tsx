import {notFound} from 'next/navigation';
import {getDrills} from '../../../../lib/drills';
import {drillSubjects} from '../../../../lib/drill-catalog';
import MojoApp from '../../../page';

export const dynamic = 'force-dynamic';
export default async function SubjectSkills({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  if (!drillSubjects.some(subject => subject.id === id)) notFound();
  return <MojoApp initialView="Drill" initialDrills={await getDrills()} drillSubjectId={id}/>;
}
