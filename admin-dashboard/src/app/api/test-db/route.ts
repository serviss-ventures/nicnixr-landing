import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test 1: Check if database is accessible
    console.log('Testing database connection...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Test 2: Check users table
    console.log('Checking users table...');
    
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
      
    if (usersError) {
      throw new Error(`Failed to query users: ${usersError.message}`);
    }
    
    // Test 3: Check substance types enum
    console.log('Checking substance types...');
    
    const { data: substanceTypes, error: substanceError } = await supabaseAdmin
      .rpc('get_enum_values', { enum_type: 'substance_type' })
      .single();
    
    if (substanceError) {
      console.log('Error getting substance types:', substanceError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      users: users,
      substanceTypes: substanceTypes || null,
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
} 