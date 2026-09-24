import type {Drill, DrillQuestion} from './drills';
import skillTree from '../data/skill-tree.json' with {type: 'json'};

// Only skills with an authored, mathematically checked template are available.
export const generatedSkills = ['bilangan', 'aljabar', 'persamaan', 'fungsi', 'geometri', 'data'];

export function relaxedDrill(subjectId: string, skillId?: string): Drill | undefined {
  const subject = skillTree.nodes.find(node => node.id === subjectId && node.kind === 'category');
  if (!subject) return;
  const pool = skillTree.nodes.filter(node => node.subject === subject.subject && generatedSkills.includes(node.id) && (!skillId || node.id === skillId));
  if (!pool.length) return;
  return {
    id: `relaxed-${subjectId}-${skillId ?? 'all'}`, title: 'Latihan Santai', mode: 'quick',
    subject: subject.name, skillId: skillId ?? subjectId, topic: skillId ? pool[0].name : subject.name,
    description: 'Soal baru terus tersedia. Tidak ada batas waktu—berhenti kapan pun kamu mau.',
    color: 'mint', minutes: 0, xp: 0, questions: [], generatedSkillIds: pool.map(node => node.id),
  };
}

export function generateQuestion(skillId: string, sequence: number, random = Math.random): DrillQuestion {
  if (!generatedSkills.includes(skillId)) throw new Error(`No generator for ${skillId}`);
  const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
  const a = int(2, 15), b = int(1, 30), x = int(-15, 25);
  let text: string, explanation: string, result: number;
  switch (skillId) {
    case 'bilangan':
      result = a * b + x;
      text = `Hitung ${a} × ${b} + (${x}).`;
      explanation = `Kerjakan perkalian terlebih dahulu: ${a} × ${b} = ${a * b}. Kemudian tambahkan ${x}, sehingga hasilnya ${result}.`;
      break;
    case 'aljabar':
      result = a + b;
      text = `Bentuk ${a}x + ${b}x dapat ditulis sebagai kx. Berapa nilai k?`;
      explanation = `Suku sejenis dijumlahkan koefisiennya: (${a} + ${b})x = ${result}x. Jadi k = ${result}.`;
      break;
    case 'persamaan':
      result = x;
      text = `Jika ${a}x + ${b} = ${a * x + b}, berapakah nilai x?`;
      explanation = `Kurangi kedua ruas dengan ${b}: ${a}x = ${a * x}. Bagi dengan ${a}, sehingga x = ${x}.`;
      break;
    case 'fungsi':
      result = a * x + b;
      text = `Diketahui f(x) = ${a}x + ${b}. Berapakah f(${x})?`;
      explanation = `Substitusikan ${x}: f(${x}) = ${a} × (${x}) + ${b} = ${result}.`;
      break;
    case 'geometri':
      result = a * b;
      text = `Persegi panjang memiliki panjang ${b} cm dan lebar ${a} cm. Berapa luasnya dalam cm²?`;
      explanation = `Luas = panjang × lebar = ${b} × ${a} = ${result} cm².`;
      break;
    default:
      result = b;
      text = `Berapa rata-rata dari ${b - a}, ${b}, dan ${b + a}?`;
      explanation = `Jumlah ketiga nilai adalah ${3 * b}. Bagi dengan 3, sehingga rata-ratanya ${b}.`;
  }
  const choices = [result, result + int(1, 5), result - int(1, 5), result + int(6, 10)];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = int(0, i);
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  const correct = choices.indexOf(result);
  return {
    id: `${skillId}-${sequence}`,
    text,
    answers: choices.map((choice, position) => ({
      id: sequence * 10 + position,
      text: String(choice),
      position,
      isCorrect: position === correct,
    })),
    correct,
    explanation,
  };
}
