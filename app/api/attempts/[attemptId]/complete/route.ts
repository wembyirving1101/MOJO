import { NextResponse } from 'next/server';
import sql from '../../../../../lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    if (!attemptId) {
      return NextResponse.json(
        { error: 'attemptId wajib diisi' },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE attempts
      SET
        status = 'completed',
        completed_at = NOW()
      WHERE id = ${attemptId}
        AND status = 'in_progress'
      RETURNING
        id,
        user_id,
        drill_id,
        started_at,
        completed_at,
        status
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          error:
            'Attempt tidak ditemukan atau sudah selesai',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error('Failed to complete attempt:', error);

    return NextResponse.json(
      { error: 'Gagal menyelesaikan attempt' },
      { status: 500 }
    );
  }
}