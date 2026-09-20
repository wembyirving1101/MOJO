import { NextResponse } from 'next/server';
import sql from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userId, drillId } = body;

    if (!userId || !drillId) {
      return NextResponse.json(
        { error: 'userId dan drillId wajib diisi' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO attempts (
        user_id,
        drill_id,
        status
      )
      VALUES (
        ${userId},
        ${drillId},
        'in_progress'
      )
      RETURNING id, user_id, drill_id, started_at, status
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create attempt:', error);

    return NextResponse.json(
      { error: 'Gagal membuat attempt' },
      { status: 500 }
    );
  }
}