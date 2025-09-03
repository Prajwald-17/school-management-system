/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getConnection();
    const [rows] = await pool.query('SELECT * FROM schools ORDER BY created_at DESC');
    return NextResponse.json({ success: true, schools: rows });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch schools' }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const contact = formData.get('contact') as string;
    const email_id = formData.get('email_id') as string;
    const image = formData.get('image') as string | null;

    // Basic server-side validation
    if (!name || !address || !city || !state || !contact || !email_id) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const pool = await getConnection();
    const [result] = await pool.query(
      'INSERT INTO schools (name, address, city, state, contact, email_id, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, address, city, state, contact, email_id, image]
    );

    return NextResponse.json({ success: true, message: 'School added', id: (result as any).insertId }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
