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
    
    const { count, error: countError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error querying users table:', countError);
      return NextResponse.json({ 
        success: false, 
        error: countError.message,
        details: countError 
      }, { status: 500 });
    }
    
    // Test 3: Check substance types enum
    console.log('Checking substance types...');
    
    const { data: substanceTypes, error: enumError } = await supabaseAdmin
      .rpc('get_enum_values', { enum_type: 'substance_type' });
    
    if (enumError) {
      console.error('Error getting substance types:', enumError);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        connection: 'successful',
        usersCount: count || 0,
        substanceTypes: substanceTypes || [],
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 