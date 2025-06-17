import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const JOURNAL_ENTRIES_KEY = '@recovery_journal_entries';
const SYNC_STATUS_KEY = '@journal_sync_status';

export interface JournalEntry {
  // Core Mental Health
  mood_positive: boolean | null;
  had_cravings: boolean | null;
  craving_intensity: number;
  stress_high: boolean | null;
  anxiety_level: number;
  
  // Core Physical
  sleep_quality: boolean | null;
  sleep_hours: number;
  energy_level: number;
  
  // Core Behavioral
  triggers_encountered: boolean | null;
  coping_strategies_used: boolean | null;
  
  // Additional Mental Health
  used_breathing: boolean | null;
  meditation_minutes: number;
  mood_swings: boolean | null;
  irritability: boolean | null;
  concentration: number;
  
  // Additional Physical
  water_glasses: number;
  exercised: boolean | null;
  exercise_minutes: number;
  appetite: number;
  headaches: boolean | null;
  
  // Additional Behavioral
  social_support: boolean | null;
  avoided_triggers: boolean | null;
  productive_day: boolean | null;
  
  // Additional Wellness
  grateful_for: string;
  biggest_challenge: string;
  tomorrow_goal: string;
  
  // Custom Notes
  notes: string;
}

interface SyncStatus {
  [dateKey: string]: {
    synced: boolean;
    lastSyncAttempt?: string;
    error?: string;
  };
}

class JournalService {
  private syncInProgress = false;

  /**
   * Save journal entry locally and sync to Supabase
   */
  async saveEntry(date: Date, entry: JournalEntry): Promise<void> {
    const dateKey = this.formatDateKey(date);
    
    // Save locally first
    await this.saveLocalEntry(dateKey, entry);
    
    // Attempt to sync to Supabase
    try {
      await this.syncEntryToSupabase(dateKey, entry);
    } catch (error) {
      console.error('Failed to sync journal entry:', error);
      // Mark as unsynced for later retry
      await this.updateSyncStatus(dateKey, false, error.message);
    }
  }

  /**
   * Get journal entry for a specific date
   */
  async getEntry(date: Date): Promise<JournalEntry | null> {
    const dateKey = this.formatDateKey(date);
    
    // Try to get from Supabase first
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('entry_date', dateKey)
        .single();

      if (!error && data) {
        // Update local cache
        await this.saveLocalEntry(dateKey, this.mapFromDatabase(data));
        return this.mapFromDatabase(data);
      }
    } catch (error) {
      console.log('Failed to fetch from Supabase, using local:', error.message);
    }

    // Fall back to local storage
    return this.getLocalEntry(dateKey);
  }

  /**
   * Get all journal entries
   */
  async getAllEntries(): Promise<{ [dateKey: string]: JournalEntry }> {
    // Get local entries first
    const localEntries = await this.getAllLocalEntries();
    
    // Try to sync with Supabase
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return localEntries;

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.user.id)
        .order('entry_date', { ascending: false });

      if (!error && data) {
        // Merge with local entries
        const supabaseEntries: { [dateKey: string]: JournalEntry } = {};
        data.forEach(entry => {
          supabaseEntries[entry.entry_date] = this.mapFromDatabase(entry);
        });

        // Update local cache with Supabase data
        const merged = { ...localEntries, ...supabaseEntries };
        await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(merged));
        
        return merged;
      }
    } catch (error) {
      console.error('Failed to sync all entries:', error);
    }

    return localEntries;
  }

  /**
   * Sync all unsynced entries to Supabase
   */
  async syncPendingEntries(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return;

      const syncStatus = await this.getSyncStatus();
      const localEntries = await this.getAllLocalEntries();

      for (const [dateKey, status] of Object.entries(syncStatus)) {
        if (!status.synced && localEntries[dateKey]) {
          try {
            await this.syncEntryToSupabase(dateKey, localEntries[dateKey]);
          } catch (error) {
            console.error(`Failed to sync entry for ${dateKey}:`, error);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Delete a journal entry
   */
  async deleteEntry(date: Date): Promise<void> {
    const dateKey = this.formatDateKey(date);

    // Delete from Supabase
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        await supabase
          .from('journal_entries')
          .delete()
          .eq('user_id', user.user.id)
          .eq('entry_date', dateKey);
      }
    } catch (error) {
      console.error('Failed to delete from Supabase:', error);
    }

    // Delete locally
    const entries = await this.getAllLocalEntries();
    delete entries[dateKey];
    await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));

    // Remove sync status
    const syncStatus = await this.getSyncStatus();
    delete syncStatus[dateKey];
    await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(syncStatus));
  }

  // Private helper methods

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async saveLocalEntry(dateKey: string, entry: JournalEntry): Promise<void> {
    const entries = await this.getAllLocalEntries();
    entries[dateKey] = entry;
    await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
  }

  private async getLocalEntry(dateKey: string): Promise<JournalEntry | null> {
    const entries = await this.getAllLocalEntries();
    return entries[dateKey] || null;
  }

  private async getAllLocalEntries(): Promise<{ [dateKey: string]: JournalEntry }> {
    try {
      const saved = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load local entries:', error);
      return {};
    }
  }

  private async syncEntryToSupabase(dateKey: string, entry: JournalEntry): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) throw new Error('Not authenticated');

    const dbEntry = this.mapToDatabase(entry, user.user.id, dateKey);

    const { error } = await supabase
      .from('journal_entries')
      .upsert(dbEntry, {
        onConflict: 'user_id,entry_date'
      });

    if (error) throw error;

    // Mark as synced
    await this.updateSyncStatus(dateKey, true);
  }

  private async getSyncStatus(): Promise<SyncStatus> {
    try {
      const saved = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      return {};
    }
  }

  private async updateSyncStatus(dateKey: string, synced: boolean, error?: string): Promise<void> {
    const status = await this.getSyncStatus();
    status[dateKey] = {
      synced,
      lastSyncAttempt: new Date().toISOString(),
      error
    };
    await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
  }

  // Map between local format and database format
  private mapToDatabase(entry: JournalEntry, userId: string, dateKey: string): any {
    return {
      user_id: userId,
      entry_date: dateKey,
      ...entry
    };
  }

  private mapFromDatabase(dbEntry: any): JournalEntry {
    const { id, user_id, entry_date, created_at, updated_at, ...journalData } = dbEntry;
    return journalData as JournalEntry;
  }
}

export const journalService = new JournalService(); 