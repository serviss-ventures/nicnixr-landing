import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_ENTRIES_KEY = '@recovery_journal_entries';

export const checkJournalEntries = async () => {
  try {
    console.log('=== CHECKING JOURNAL ENTRIES ===');
    
    // Get all stored entries
    const entriesJson = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
    
    if (!entriesJson) {
      console.log('No journal entries found');
      return;
    }
    
    const entries = JSON.parse(entriesJson);
    const dates = Object.keys(entries).sort();
    
    console.log(`Total entries: ${dates.length}`);
    console.log('Dates with entries:', dates);
    
    // Check June 16 specifically
    const june16Key = '2024-06-16';
    if (entries[june16Key]) {
      console.log('\nJune 16 entry found:');
      console.log(JSON.stringify(entries[june16Key], null, 2));
    } else {
      console.log('\nNo entry found for June 16');
    }
    
    // Show last 5 entries
    console.log('\nLast 5 entries:');
    dates.slice(-5).forEach(date => {
      console.log(`${date}: ${entries[date].notes ? 'Has notes' : 'No notes'}`);
    });
    
  } catch (error) {
    console.error('Error checking journal entries:', error);
  }
};

// Function to manually add a test entry for June 16
export const addTestJournalEntry = async () => {
  try {
    const entriesJson = await AsyncStorage.getItem(JOURNAL_ENTRIES_KEY);
    const entries = entriesJson ? JSON.parse(entriesJson) : {};
    
    // Add test entry for June 16
    entries['2024-06-16'] = {
      moodPositive: true,
      hadCravings: false,
      cravingIntensity: 3,
      stressHigh: false,
      anxietyLevel: 4,
      sleepQuality: true,
      sleepHours: 8,
      energyLevel: 7,
      triggersEncountered: false,
      copingStrategiesUsed: true,
      usedBreathing: true,
      meditationMinutes: 10,
      moodSwings: false,
      irritability: false,
      concentration: 8,
      waterGlasses: 8,
      exercised: true,
      exerciseMinutes: 30,
      appetite: 7,
      headaches: false,
      socialSupport: true,
      avoidedTriggers: true,
      productiveDay: true,
      gratefulFor: 'Made it through another day smoke-free',
      biggestChallenge: 'Morning coffee without cigarettes',
      tomorrowGoal: 'Continue the streak and stay strong',
      notes: 'This is a test entry for June 16th to verify journal navigation.',
    };
    
    await AsyncStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
    console.log('Test entry added for June 16, 2024');
  } catch (error) {
    console.error('Error adding test entry:', error);
  }
}; 