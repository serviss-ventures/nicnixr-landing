import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function hashPassword(password: string): Promise<string> {
  return createHash('sha256').update(password).digest('hex');
}

async function runMigration() {
  try {
    // First, add the password_hash column if it doesn't exist
    const { error: alterError } = await supabase.rpc('query', {
      query: `ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS password_hash TEXT;`
    }).single();

    if (alterError && !alterError.message.includes('already exists')) {
      console.log('Note: Could not add password_hash column via RPC. Trying direct approach...');
    }
  } catch (error) {
    console.log('Migration note:', error);
  }
}

async function createAdminUser() {
  const email = 'admin@nixrapp.com';
  const password = 'NixrAdmin2025!';
  const role = 'super_admin'; // Use lowercase with underscore

  try {
    // Run migration first
    await runMigration();

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', selectError);
      process.exit(1);
    }

    if (existingUser) {
      console.log('Admin user already exists. Updating...');
      console.log('Current user:', existingUser);
      
      // Update the user
      const { data: updatedUser, error: updateError } = await supabase
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          is_active: true,
          role: role,
        })
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating admin user:', updateError);
        process.exit(1);
      }

      console.log('Admin user updated successfully!');
      console.log('Updated user:', updatedUser);
    } else {
      // Create new admin user
      const { data: newUser, error: createError } = await supabase
        .from('admin_users')
        .insert({
          email,
          password_hash: passwordHash,
          role,
          is_active: true,
          metadata: {
            created_via: 'setup_script',
            created_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating admin user:', createError);
        process.exit(1);
      }

      console.log('Admin user created successfully!');
      console.log('User ID:', newUser.id);
    }

    console.log('\nYou can now log in with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nMake sure to change the password after first login!');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
createAdminUser(); 