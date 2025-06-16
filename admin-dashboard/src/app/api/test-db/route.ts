import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables. Please check your .env.local file.',
      }, { status: 500 });
    }

    // Test 2: Try to count users table
    const { count, error: countError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({
        success: false,
        error: 'Database tables not found. Please run the database schema SQL.',
        details: countError.message,
      }, { status: 500 });
    }

    // Test 3: Check if we can query the enums (optional test)
    let enumStatus = 'Enum check skipped';
    try {
      const { data: substanceTypes, error: enumError } = await supabaseAdmin
        .rpc('get_enum_values', { enum_type: 'substance_type' });
      
      if (!enumError && substanceTypes) {
        enumStatus = '✅ Enums configured';
      }
    } catch (err) {
      // This is expected if the function doesn't exist yet
      enumStatus = 'Enums not configured (optional)';
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      status: {
        environment: '✅ Environment variables loaded',
        database: '✅ Database tables exist',
        enums: enumStatus,
        userCount: count || 0,
        ready: true,
      },
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 