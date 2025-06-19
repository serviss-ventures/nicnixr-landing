import { NextRequest, NextResponse } from 'next/server';
import { simpleAdminAuth } from '@/lib/simpleAdminAuth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (token) {
      await simpleAdminAuth.logout(token);
    }

    // Clear cookie
    cookieStore.delete('admin_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: true }); // Always succeed on logout
  }
} 