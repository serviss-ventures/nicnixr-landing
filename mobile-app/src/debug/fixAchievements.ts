import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug function to fix achievement issues
 * This will properly unlock achievements based on current stats
 */
export const fixAchievements = async () => {
  try {
    console.log('🔧 Starting achievement fix...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('❌ No user logged in');
      return;
    }
    
    console.log('👤 User:', user.id);
    
    // Get user stats
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (statsError) {
      console.error('❌ Error fetching user stats:', statsError);
      
      // Try to get days clean from local storage
      const progressData = await AsyncStorage.getItem('@progress_data');
      if (progressData) {
        const progress = JSON.parse(progressData);
        const daysClean = progress.stats?.daysClean || 0;
        console.log('📱 Days clean from local storage:', daysClean);
        
        // Create user stats if missing
        const { error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            days_clean: daysClean,
            cravings_resisted: progress.stats?.cravingsResisted || 0,
            money_saved: progress.stats?.moneySaved || 0,
            health_score: progress.stats?.healthScore || 0
          });
          
        if (insertError) {
          console.error('❌ Error creating user stats:', insertError);
        } else {
          console.log('✅ Created user stats with days clean:', daysClean);
        }
      }
    } else {
      console.log('📊 User stats found:', {
        days_clean: userStats.days_clean,
        cravings_resisted: userStats.cravings_resisted,
        money_saved: userStats.money_saved,
        health_score: userStats.health_score
      });
    }
    
    // Get current days clean
    const daysClean = userStats?.days_clean || 0;
    
    // Check and unlock achievements
    console.log('🏆 Checking achievements for', daysClean, 'days clean...');
    
    const { data: unlockedAchievements, error: achievementError } = await supabase
      .rpc('check_and_unlock_achievements', { p_user_id: user.id });
      
    if (achievementError) {
      console.error('❌ Error checking achievements:', achievementError);
      
      // Manual achievement check
      console.log('🔄 Attempting manual achievement unlock...');
      
      // Get all achievement definitions
      const { data: definitions, error: defError } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true);
        
      if (defError) {
        console.error('❌ Error fetching achievement definitions:', defError);
        return;
      }
      
      console.log('📋 Found', definitions?.length || 0, 'achievement definitions');
      
      // Check each achievement
      for (const def of definitions || []) {
        const criteria = def.unlock_criteria as any;
        let shouldUnlock = false;
        
        switch (criteria.type) {
          case 'days_clean':
            shouldUnlock = daysClean >= criteria.value;
            break;
          case 'cravings_resisted':
            shouldUnlock = (userStats?.cravings_resisted || 0) >= criteria.value;
            break;
          case 'money_saved':
            shouldUnlock = (userStats?.money_saved || 0) >= criteria.value;
            break;
          case 'health_score':
            shouldUnlock = (userStats?.health_score || 0) >= criteria.value;
            break;
        }
        
        if (shouldUnlock) {
          // Check if already unlocked
          const { data: existing } = await supabase
            .from('user_achievements')
            .select('id')
            .eq('user_id', user.id)
            .eq('achievement_definition_id', def.id)
            .single();
            
          if (!existing) {
            // Unlock the achievement
            const { error: unlockError } = await supabase
              .from('user_achievements')
              .insert({
                user_id: user.id,
                achievement_definition_id: def.id
              });
              
            if (unlockError) {
              console.error(`❌ Error unlocking ${def.name}:`, unlockError);
            } else {
              console.log(`✅ Unlocked: ${def.name}`);
            }
          } else {
            console.log(`✓ Already unlocked: ${def.name}`);
          }
        }
      }
    } else {
      console.log('🎉 Achievements checked successfully!');
      if (unlockedAchievements && unlockedAchievements.length > 0) {
        console.log('🏆 Newly unlocked:');
        unlockedAchievements.forEach((a: any) => {
          console.log(`  - ${a.achievement_name} (${a.achievement_category})`);
        });
      }
    }
    
    // Get all user achievements
    const { data: userAchievements, error: fetchError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement_definitions (
          name,
          description,
          category,
          icon,
          rarity
        )
      `)
      .eq('user_id', user.id);
      
    if (fetchError) {
      console.error('❌ Error fetching user achievements:', fetchError);
    } else {
      console.log(`📊 Total achievements earned: ${userAchievements?.length || 0} / 16`);
      userAchievements?.forEach((ua: any) => {
        console.log(`  ✓ ${ua.achievement_definitions.name}`);
      });
    }
    
    console.log('✅ Achievement fix complete!');
    console.log('🔄 Please refresh the app to see updated achievements');
    
  } catch (error) {
    console.error('❌ Unexpected error in fixAchievements:', error);
  }
};

// Make it available globally for debugging
if (typeof global !== 'undefined') {
  (global as any).fixAchievements = fixAchievements;
} 