import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  const email = 'admin@nixr.app';
  const password = 'NixrAdmin2025!'; // Change this!

  try {
    // Create user
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    
    // You can also add custom user metadata here if needed
    if (user?.user?.id) {
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: user.user.id,
          email: email,
          full_name: 'Admin User',
          role: 'admin',
        });

      if (updateError) {
        console.error('Error updating user profile:', updateError);
      } else {
        console.log('✅ User profile updated');
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createAdminUser(); 