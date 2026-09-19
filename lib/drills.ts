import data from '../data/drills.json';
export type DrillQuestion = {id:string;text:string;answers:string[];correct:number;explanation:string};
export type Drill = {id:string;title:string;description:string;mode:string;color:string;skillId:string;subject:string;topic:string;minutes:number;xp:number;questions:DrillQuestion[]};
export const drills:Drill[]=data.drills;
export function getDrill(id:string){return drills.find(drill=>drill.id===id);}
