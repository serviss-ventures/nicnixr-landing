import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function generateTestActivity() {
  console.log('🚀 Generating test activity for monitoring dashboard...\n');

  try {
    // 1. Create a test user if needed
    const testEmail = `test-monitor-${Date.now()}@nixr.app`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating test user:', authError);
      return;
    }

    const userId = authData.user.id;
    console.log('✅ Created test user:', testEmail);

    // 2. Update user profile to simulate activity
    await supabase
      .from('users')
      .update({ 
        updated_at: new Date().toISOString(),
        full_name: 'Test Monitor User',
        substance_type: 'vape',
        quit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      })
      .eq('id', userId);
    console.log('✅ Updated user profile');

    // 3. Create some AI coach activity
    const { data: session } = await supabase
      .from('ai_coach_sessions')
      .insert({
        user_id: userId,
        started_at: new Date().toISOString(),
        mood: 'motivated',
        topic: 'testing'
      })
      .select()
      .single();

    if (session) {
      // Add some messages
      for (let i = 0; i < 5; i++) {
        await supabase
          .from('ai_coach_messages')
          .insert({
            session_id: session.id,
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: i % 2 === 0 ? 'Test question' : 'Test response',
            response_time_ms: Math.floor(Math.random() * 500) + 200
          });
      }
      console.log('✅ Created AI coach session with messages');
    }

    // 4. Create community posts
    for (let i = 0; i < 3; i++) {
      await supabase
        .from('community_posts')
        .insert({
          user_id: userId,
          content: `Test post ${i + 1} for monitoring`,
          milestone_type: 'days_clean',
          milestone_value: 7
        });
    }
    console.log('✅ Created community posts');

    // 5. Create journal entries
    await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        mood: 'good',
        mood_emoji: '😊',
        content: 'Test journal entry for monitoring'
      });
    console.log('✅ Created journal entry');

    // 6. Simulate some errors for testing
    await supabase
      .from('ai_coach_audit_log')
      .insert([
        {
          user_id: userId,
          action: 'error_logged',
          risk_level: 'high',
          metadata: {
            error: 'Test error for monitoring',
            stack_trace: 'Error: Test error\n  at generateTestActivity',
            platform: 'ios',
            version: '1.0.0',
            device: 'iPhone 15',
            os: 'iOS 17.2'
          }
        }
      ]);
    console.log('✅ Created test error log');

    console.log('\n🎉 Test activity generated successfully!');
    console.log('📊 Check your monitoring dashboard to see the updated metrics');

  } catch (error) {
    console.error('Error generating test activity:', error);
  }
}

// Run the script
generateTestActivity(); 