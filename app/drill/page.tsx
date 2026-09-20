import MojoApp from '../page';
import { getDrills } from '../../lib/drills';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Drill — Mojo',
  description: 'Pilih latihan mockup Mojo dan mulai belajar.',
};

export default async function DrillCatalog() {
  const drills = await getDrills();

  return (
    <MojoApp
      initialView="Drill"
      initialDrills={drills}
    />
  );
}