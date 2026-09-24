
import sql from './db';

export type DrillAnswer = {
  id: number;
  text: string;
  position: number;
  isCorrect: boolean;
};

export type DrillQuestion = {
  id: string;
  text: string;
  answers: DrillAnswer[];
  correct: number;
  explanation: string;
};

export type Drill = {
  id: string;
  title: string;
  description: string;
  mode: string;
  color: string;
  skillId: string;
  subject: string;
  topic: string;
  minutes: number;
  xp: number;
  questions: DrillQuestion[];
  generatedSkillIds?: string[];
};

// Temporary: masih dipakai oleh halaman yang belum dipindahkan ke DB


// Ambil semua drill dari PostgreSQL
export async function getDrills(): Promise<Drill[]> {
  const rows = await sql`
    SELECT
      d.id AS drill_id,
      d.title,
      d.description,
      d.mode,
      d.color,
      d.skill_id,
      d.subject,
      d.topic,
      d.minutes,
      d.xp,
      dq.position AS question_position,
      q.id AS question_id,
      q.text AS question_text,
      q.explanation,
      a.id AS answer_id,
      a.position AS answer_position,
      a.answer_text,
      a.is_correct
    FROM drills d
    JOIN drill_questions dq
      ON dq.drill_id = d.id
    JOIN questions q
      ON q.id = dq.question_id
    JOIN answers a
      ON a.question_id = q.id
    ORDER BY d.id, dq.position, a.position
  `;

  const drillMap = new Map<string, Drill>();

  for (const row of rows) {
    if (!drillMap.has(row.drill_id)) {
      drillMap.set(row.drill_id, {
        id: row.drill_id,
        title: row.title,
        description: row.description ?? '',
        mode: row.mode,
        color: row.color ?? '',
        skillId: row.skill_id,
        subject: row.subject,
        topic: row.topic,
        minutes: row.minutes,
        xp: row.xp,
        questions: [],
      });
    }

    const drill = drillMap.get(row.drill_id)!;

    let question = drill.questions.find(
      q => q.id === row.question_id
    );

    if (!question) {
      question = {
        id: row.question_id,
        text: row.question_text,
        answers: [],
        correct: 0,
        explanation: row.explanation ?? '',
      };

      drill.questions.push(question);
    }

    question.answers.push({
      id: Number(row.answer_id),
      text: row.answer_text,
      position: row.answer_position,
      isCorrect: row.is_correct,
    });

    if (row.is_correct) {
      question.correct = row.answer_position;
    }
  }

  return Array.from(drillMap.values());
}

// Ambil satu drill dari PostgreSQL
export async function getDrill(id: string): Promise<Drill | undefined> {
  const allDrills = await getDrills();
  return allDrills.find(drill => drill.id === id);
}
