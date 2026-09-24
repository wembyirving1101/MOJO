import skillTree from '../data/skill-tree.json' with {type: 'json'};
import type {SkillNode} from './skill-tree';
const skillNodes = skillTree.nodes as SkillNode[];
import type {Drill} from './drills';

export const drillModes = [
  {id: 'quick', name: 'Latihan Santai', color: 'mint', description: 'Soal tanpa batas, tanpa tekanan waktu. Belajar dengan ritmemu sendiri dan berhenti kapan pun kamu mau.'},
  {id: 'deep', name: 'Latihan Dalam', color: 'purple', description: 'Luangkan waktu untuk mendalami materi dan memahami pembahasan.'},
  {id: 'focus', name: 'Latihan Kelemahan', color: 'peach', description: 'Perkuat pemahaman lewat paket soal fokus.'},
] as const;
export const drillSubjects = skillNodes.filter(node => node.kind === 'category');
export function subjectSkills(subjectId: string) {
  const subject = drillSubjects.find(node => node.id === subjectId);
  return subject ? skillNodes.filter(node => !node.kind && node.subject === subject.subject) : [];
}
export function subjectDrills(drills: Drill[], subjectId: string) {
  const ids = new Set(subjectSkills(subjectId).map(node => node.id));
  return drills.filter(drill => ids.has(drill.skillId) && drill.questions.length > 0);
}
export function overallDrill(drills: Drill[], subjectId: string, mode?: string, skillId?: string): Drill | undefined {
  const subject = drillSubjects.find(node => node.id === subjectId);
  const chosenMode = drillModes.find(item => item.id === mode);
  if (mode && !chosenMode) return;
  const available = subjectDrills(drills, subjectId).filter(drill => (!mode || drill.mode === mode) && (!skillId || drill.skillId === skillId));
  if (!subject || !available.length) return;
  const questions = [...new Map(available.flatMap(drill => drill.questions).map(q => [q.id, q])).values()];
  return {
    id: `subject-${subject.id}-${mode ?? 'overall'}-${skillId ?? 'all'}`, title: chosenMode ? `${chosenMode.name} — ${skillNodes.find(node => node.id === skillId)?.name ?? subject.name}` : `Tes ${subject.name}`, subject: subject.name,
    description: 'Latihan gabungan dari soal yang tersedia pada materi ini.',
    mode: mode ?? 'overall', color: chosenMode?.color ?? 'mint', skillId: subject.id, topic: 'Latihan gabungan',
    minutes: Math.max(1, Math.ceil(questions.length * 1.5)), xp: 0, questions,
  };
}
