import { NextResponse } from 'next/server';
import sql from '../../../../../lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();

    const {
      questionId,
      answerId,
    }: {
      questionId: string;
      answerId: number;
    } = body;

    if (!attemptId || !questionId || !answerId) {
      return NextResponse.json(
        {
          error: 'attemptId, questionId, dan answerId wajib diisi',
        },
        { status: 400 }
      );
    }

    // Cek apakah answer memang milik question tersebut
    const answerResult = await sql`
      SELECT
        id,
        question_id,
        is_correct
      FROM answers
      WHERE id = ${answerId}
        AND question_id = ${questionId}
      LIMIT 1
    `;

    if (answerResult.length === 0) {
      return NextResponse.json(
        {
          error: 'Jawaban tidak valid untuk question tersebut',
        },
        { status: 400 }
      );
    }

    const answer = answerResult[0];

    // Simpan jawaban user
    const result = await sql`
      INSERT INTO attempt_answers (
        attempt_id,
        question_id,
        answer_id,
        is_correct
      )
      VALUES (
        ${attemptId},
        ${questionId},
        ${answer.id},
        ${answer.is_correct}
      )
      RETURNING
        id,
        attempt_id,
        question_id,
        answer_id,
        is_correct,
        answered_at
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to save answer:', error);

    return NextResponse.json(
      {
        error: 'Gagal menyimpan jawaban',
      },
      { status: 500 }
    );
  }
}