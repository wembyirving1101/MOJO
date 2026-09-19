import {notFound} from 'next/navigation';
import {drills,getDrill} from '../../../lib/drills';
import DrillSession from './session';
export function generateStaticParams(){return drills.map(({id})=>({id}));}
export const dynamicParams=false;
export async function generateMetadata({params}:{params:Promise<{id:string}>}){
  const drill=getDrill((await params).id);
  return {title:drill?`${drill.title} — Mojo`:'Latihan tidak ditemukan — Mojo'};
}
export default async function DrillPage({params}:{params:Promise<{id:string}>}){
  const drill=getDrill((await params).id);
  if(!drill)notFound();
  return <DrillSession key={drill.id} drill={drill}/>;
}
