// Avatar System - Multiple Style Options for NicNixr

export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  category: string;
  unlockRequirement?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// STYLE OPTION 1: Emoji-Based Avatars (Simple but effective)
export const EMOJI_AVATARS: Avatar[] = [
  // Common Avatars (Available from start)
  { id: 'warrior', emoji: '⚔️', name: 'Warrior', category: 'starter', rarity: 'common' },
  { id: 'phoenix', emoji: '🔥', name: 'Phoenix', category: 'starter', rarity: 'common' },
  { id: 'star', emoji: '⭐', name: 'Rising Star', category: 'starter', rarity: 'common' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', category: 'starter', rarity: 'common' },
  { id: 'mountain', emoji: '⛰️', name: 'Mountain', category: 'starter', rarity: 'common' },
  
  // Rare Avatars (Unlock at milestones)
  { id: 'dragon', emoji: '🐉', name: 'Dragon', category: 'milestone', rarity: 'rare', unlockRequirement: '7 days' },
  { id: 'lightning', emoji: '⚡', name: 'Lightning', category: 'milestone', rarity: 'rare', unlockRequirement: '14 days' },
  { id: 'crown', emoji: '👑', name: 'Crown', category: 'milestone', rarity: 'rare', unlockRequirement: '30 days' },
  
  // Epic Avatars
  { id: 'galaxy', emoji: '🌌', name: 'Galaxy', category: 'achievement', rarity: 'epic', unlockRequirement: '60 days' },
  { id: 'diamond', emoji: '💎', name: 'Diamond', category: 'achievement', rarity: 'epic', unlockRequirement: '90 days' },
  
  // Legendary Avatars
  { id: 'infinity', emoji: '♾️', name: 'Infinity', category: 'legend', rarity: 'legendary', unlockRequirement: '365 days' },
];

// STYLE OPTION 2: Character-Based Avatars (More personality)
export const CHARACTER_AVATARS: Avatar[] = [
  // Starter Characters
  { id: 'ninja', emoji: '🥷', name: 'Shadow Ninja', category: 'starter', rarity: 'common' },
  { id: 'astronaut', emoji: '👨‍🚀', name: 'Space Explorer', category: 'starter', rarity: 'common' },
  { id: 'wizard', emoji: '🧙‍♂️', name: 'Wise Wizard', category: 'starter', rarity: 'common' },
  { id: 'superhero', emoji: '🦸', name: 'Hero', category: 'starter', rarity: 'common' },
  { id: 'viking', emoji: '🧔‍♂️', name: 'Viking', category: 'starter', rarity: 'common' },
  
  // Unlockable Characters
  { id: 'robot', emoji: '🤖', name: 'Tech Bot', category: 'milestone', rarity: 'rare', unlockRequirement: '21 days' },
  { id: 'alien', emoji: '👽', name: 'Cosmic Being', category: 'achievement', rarity: 'epic', unlockRequirement: '100 days' },
  { id: 'genie', emoji: '🧞', name: 'Wish Master', category: 'legend', rarity: 'legendary', unlockRequirement: '1 year' },
];

// STYLE OPTION 3: Animal Spirit Avatars (Symbolic & Meaningful)
export const ANIMAL_AVATARS: Avatar[] = [
  // Starter Animals
  { id: 'wolf', emoji: '🐺', name: 'Lone Wolf', category: 'starter', rarity: 'common' },
  { id: 'eagle', emoji: '🦅', name: 'Soaring Eagle', category: 'starter', rarity: 'common' },
  { id: 'lion', emoji: '🦁', name: 'Brave Lion', category: 'starter', rarity: 'common' },
  { id: 'tiger', emoji: '🐅', name: 'Fierce Tiger', category: 'starter', rarity: 'common' },
  { id: 'bear', emoji: '🐻', name: 'Strong Bear', category: 'starter', rarity: 'common' },
  
  // Milestone Animals
  { id: 'phoenix_bird', emoji: '🦅', name: 'Phoenix', category: 'milestone', rarity: 'rare', unlockRequirement: '30 days' },
  { id: 'dragon_spirit', emoji: '🐲', name: 'Dragon Spirit', category: 'achievement', rarity: 'epic', unlockRequirement: '90 days' },
  { id: 'unicorn', emoji: '🦄', name: 'Mythical Unicorn', category: 'legend', rarity: 'legendary', unlockRequirement: '365 days' },
];

// STYLE OPTION 4: Abstract/Cosmic Avatars (Modern & Unique)
export const COSMIC_AVATARS: Avatar[] = [
  // Starter Cosmic
  { id: 'sun', emoji: '☀️', name: 'Solar Power', category: 'starter', rarity: 'common' },
  { id: 'moon', emoji: '🌙', name: 'Lunar Energy', category: 'starter', rarity: 'common' },
  { id: 'comet', emoji: '☄️', name: 'Comet', category: 'starter', rarity: 'common' },
  { id: 'atom', emoji: '⚛️', name: 'Atomic', category: 'starter', rarity: 'common' },
  { id: 'crystal', emoji: '🔮', name: 'Crystal', category: 'starter', rarity: 'common' },
  
  // Advanced Cosmic
  { id: 'nebula', emoji: '🌟', name: 'Nebula', category: 'milestone', rarity: 'rare', unlockRequirement: '45 days' },
  { id: 'blackhole', emoji: '🕳️', name: 'Black Hole', category: 'achievement', rarity: 'epic', unlockRequirement: '180 days' },
  { id: 'universe', emoji: '🪐', name: 'Universe Master', category: 'legend', rarity: 'legendary', unlockRequirement: '2 years' },
];

// Avatar Frame Colors based on rarity
export const AVATAR_FRAME_COLORS = {
  common: ['#6B7280', '#9CA3AF'], // Gray
  rare: ['#3B82F6', '#60A5FA'], // Blue
  epic: ['#8B5CF6', '#A78BFA'], // Purple
  legendary: ['#F59E0B', '#FBBF24'], // Gold
};

// Avatar Badges (Additional customization)
export const AVATAR_BADGES = {
  streak7: { emoji: '🔥', name: '7 Day Streak' },
  streak30: { emoji: '⚡', name: '30 Day Streak' },
  streak100: { emoji: '💯', name: '100 Day Streak' },
  buddy5: { emoji: '🤝', name: '5 Buddies Helped' },
  buddy25: { emoji: '💪', name: '25 Buddies Helped' },
  earlyBird: { emoji: '🌅', name: 'Early Bird' },
  nightOwl: { emoji: '🦉', name: 'Night Owl' },
  motivator: { emoji: '📣', name: 'Community Motivator' },
  scientist: { emoji: '🧬', name: 'Science Enthusiast' },
  zenMaster: { emoji: '🧘', name: 'Zen Master' },
};

// Helper function to get avatar style
export const getAvatarById = (id: string, style: 'emoji' | 'character' | 'animal' | 'cosmic' = 'emoji'): Avatar | undefined => {
  const avatarSets = {
    emoji: EMOJI_AVATARS,
    character: CHARACTER_AVATARS,
    animal: ANIMAL_AVATARS,
    cosmic: COSMIC_AVATARS,
  };
  
  return avatarSets[style].find(avatar => avatar.id === id);
};

// Get unlocked avatars based on user progress
export const getUnlockedAvatars = (daysClean: number, style: 'emoji' | 'character' | 'animal' | 'cosmic' = 'emoji'): Avatar[] => {
  const avatarSets = {
    emoji: EMOJI_AVATARS,
    character: CHARACTER_AVATARS,
    animal: ANIMAL_AVATARS,
    cosmic: COSMIC_AVATARS,
  };
  
  return avatarSets[style].filter(avatar => {
    if (!avatar.unlockRequirement) return true;
    
    const requirement = avatar.unlockRequirement.toLowerCase();
    if (requirement.includes('day')) {
      const requiredDays = parseInt(requirement);
      return daysClean >= requiredDays;
    }
    if (requirement.includes('year')) {
      const requiredYears = parseInt(requirement);
      return daysClean >= requiredYears * 365;
    }
    return false;
  });
}; 