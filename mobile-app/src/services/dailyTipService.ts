import { store } from '../store/store';
import { selectProgressStats } from '../store/slices/progressSlice';
import { getPersonalizedDailyTips, PersonalizedDailyTip } from './personalizedContentService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyTip {
  id: string;
  title: string;
  content: string;
  scientificBasis: string;
  actionableAdvice: string;
  relevantDays: number[]; // Days when this tip is most relevant (0 = any day)
  category: 'neuroplasticity' | 'health' | 'psychology' | 'practical' | 'motivation';
  icon: string;
  color: string;
  sources?: string[];
  dayNumber?: number; // Current day number for contextual encouragement
}

const DAILY_TIPS: DailyTip[] = [
  // DAYS 1-3: DETOX PHASE - Focus on immediate support and understanding
  {
    id: 'dopamine_recovery_day_1',
    title: 'Your Brain is Rewiring Right Now',
    content: 'Every moment you stay nicotine-free, your brain is actively rebuilding its natural dopamine pathways. The discomfort you might feel is actually your brain healing - it\'s learning to produce feel-good chemicals naturally again.',
    scientificBasis: 'Research shows that dopamine receptors begin to upregulate within 24-72 hours of nicotine cessation. Neuroplasticity allows your brain to form new neural connections and strengthen existing ones that support healthy behaviors.',
    actionableAdvice: 'When you feel a craving, remind yourself: "This is my brain healing." Take 5 deep breaths and visualize your neural pathways getting stronger. Try a brief walk or drink cold water to activate your reward system naturally.',
    relevantDays: [1],
    category: 'neuroplasticity',
    icon: 'flash-outline',
    color: '#8B5CF6',
    sources: [
      'Benowitz, N.L. (2010). Nicotine addiction. New England Journal of Medicine',
      'Koob, G.F. & Volkow, N.D. (2016). Neurobiology of addiction. The Lancet Psychiatry'
    ]
  },
  {
    id: 'withdrawal_understanding_day_2',
    title: 'Withdrawal is Temporary, Recovery is Permanent',
    content: 'Your body is clearing nicotine from your system right now. Peak withdrawal symptoms typically occur 24-72 hours after quitting, then gradually decrease. This temporary discomfort is your body returning to its natural, healthy state.',
    scientificBasis: 'Nicotine has a half-life of 1-2 hours, meaning it\'s mostly eliminated within 24 hours. Physical withdrawal symptoms are caused by your body readjusting to functioning without the constant presence of nicotine.',
    actionableAdvice: 'Create a "withdrawal toolkit": keep water, healthy snacks, stress balls, and calming music nearby. When symptoms peak, set a timer for 3 minutes and focus only on breathing - most cravings pass within this time.',
    relevantDays: [2],
    category: 'health',
    icon: 'medical-outline',
    color: '#10B981',
    sources: [
      'Hughes, J.R. (2007). Effects of abstinence from tobacco. Nicotine & Tobacco Research',
      'Shiffman, S. (2006). Use of more nicotine lozenges leads to better success. Addiction'
    ]
  },
  {
    id: 'sleep_recovery_day_3',
    title: 'Your Sleep is Already Improving',
    content: 'By day 3, your sleep architecture is beginning to normalize. Nicotine disrupted your REM sleep cycles, but your brain is now starting to restore natural sleep patterns. Better sleep means better mood, focus, and decision-making.',
    scientificBasis: 'Nicotine acts as a stimulant that fragments sleep and reduces REM sleep quality. Studies show sleep improvements begin within 72 hours of cessation, with continued improvement over weeks.',
    actionableAdvice: 'Establish a calming bedtime routine: dim lights 1 hour before sleep, avoid screens, try gentle stretching or meditation. If you wake up at night, practice the 4-7-8 breathing technique instead of reaching for nicotine.',
    relevantDays: [3],
    category: 'health',
    icon: 'moon-outline',
    color: '#06B6D4',
    sources: [
      'Jaehne, A. (2012). Effects of nicotine on sleep during consumption. Sleep Medicine Reviews',
      'Colrain, I.M. (2004). Sleep and the brain. Neuropsychology Review'
    ]
  },

  // DAYS 4-7: EARLY RECOVERY - Building momentum and understanding changes
  {
    id: 'taste_smell_day_4',
    title: 'Your Senses are Coming Back to Life',
    content: 'Your taste and smell receptors, damaged by nicotine, are rapidly regenerating. You might notice food tastes better and scents are more vivid. This isn\'t just recovery - it\'s your brain experiencing the world more fully.',
    scientificBasis: 'Nicotine damages taste buds and olfactory receptors. These sensory cells have a rapid turnover rate, with taste buds regenerating every 1-2 weeks and smell receptors recovering within days of cessation.',
    actionableAdvice: 'Celebrate this recovery by trying new healthy foods or revisiting old favorites. Smell fresh herbs, flowers, or essential oils. Use this enhanced sensory experience as motivation - your body is literally healing.',
    relevantDays: [4],
    category: 'health',
    icon: 'restaurant-outline',
    color: '#F59E0B',
    sources: [
      'Vennemann, M.M. (2008). The association between smoking and taste impairment. Archives of Otolaryngology',
      'Frye, R.E. (1990). Cigarette smoking and olfactory function. JAMA'
    ]
  },
  {
    id: 'circulation_day_5',
    title: 'Your Blood is Flowing Freely Again',
    content: 'Your circulation is dramatically improving. Carbon monoxide levels have normalized, and your blood can carry 15% more oxygen. Your hands and feet might feel warmer, and you may notice increased energy and mental clarity.',
    scientificBasis: 'Nicotine constricts blood vessels and carbon monoxide reduces oxygen-carrying capacity. Within days of quitting, circulation improves significantly, enhancing oxygen delivery to all organs including the brain.',
    actionableAdvice: 'Take advantage of improved circulation with gentle exercise - even a 10-minute walk will feel easier. Notice the warmth returning to your extremities. This is your cardiovascular system healing in real-time.',
    relevantDays: [5],
    category: 'health',
    icon: 'heart-outline',
    color: '#EF4444',
    sources: [
      'Benowitz, N.L. (1999). Nicotine addiction and cardiovascular disease. American Heart Journal',
      'Mahmud, A. (2003). Effect of smoking on arterial stiffness. Hypertension'
    ]
  },
  {
    id: 'stress_response_day_6',
    title: 'Learning New Ways to Handle Stress',
    content: 'Your brain is learning that stress doesn\'t require nicotine to resolve. Each time you handle stress without nicotine, you\'re building new neural pathways that will serve you for life. This is emotional growth in action.',
    scientificBasis: 'Chronic nicotine use hijacks the brain\'s natural stress response system. Recovery involves rebuilding healthy coping mechanisms and allowing the HPA axis (stress response system) to recalibrate naturally.',
    actionableAdvice: 'When stressed, try the "STOP" technique: Stop what you\'re doing, Take a breath, Observe your feelings without judgment, Proceed with intention. Each successful stress management without nicotine strengthens your recovery.',
    relevantDays: [6],
    category: 'psychology',
    icon: 'shield-checkmark-outline',
    color: '#8B5CF6',
    sources: [
      'al\'Absi, M. (2006). Hypothalamic-pituitary-adrenocortical responses to psychological stress. Psychoneuroendocrinology',
      'Cohen, S. (2008). Psychological stress and disease. JAMA'
    ]
  },
  {
    id: 'week_milestone_day_7',
    title: 'One Week: A Major Neurological Victory',
    content: 'Congratulations! You\'ve completed one week nicotine-free. Your brain has made significant progress in rebalancing neurotransmitters. The worst of physical withdrawal is behind you, and psychological healing is accelerating.',
    scientificBasis: 'One week represents a critical milestone in addiction recovery. Most physical withdrawal symptoms peak and begin declining by day 7, while neuroplasticity changes become more established.',
    actionableAdvice: 'Celebrate this achievement meaningfully - buy yourself something special with money you would have spent on nicotine. Reflect on what you\'ve learned about yourself this week. You\'ve proven you can do hard things.',
    relevantDays: [7],
    category: 'motivation',
    icon: 'trophy-outline',
    color: '#F59E0B',
    sources: [
      'Hughes, J.R. (2007). Shape of the relapse curve. Addiction',
      'Piasecki, T.M. (2006). Relapse to smoking. Clinical Psychology Review'
    ]
  },

  // DAYS 8-14: BUILDING HABITS - Establishing new patterns
  {
    id: 'energy_boost_day_8',
    title: 'Your Energy Levels are Stabilizing',
    content: 'Notice how your energy is becoming more consistent throughout the day? Without nicotine\'s artificial stimulation and subsequent crashes, your body is learning to maintain steady energy levels naturally.',
    scientificBasis: 'Nicotine creates artificial energy spikes followed by crashes, disrupting natural circadian rhythms and energy regulation. Recovery allows the body to restore normal energy metabolism and hormone cycles.',
    actionableAdvice: 'Support your natural energy with regular meals, adequate hydration, and consistent sleep. If you feel tired, try light exercise or stepping outside for fresh air instead of reaching for stimulants.',
    relevantDays: [8],
    category: 'health',
    icon: 'battery-charging-outline',
    color: '#10B981',
    sources: [
      'Parrott, A.C. (1999). Does cigarette smoking cause stress? American Psychologist',
      'Warburton, D.M. (1992). Nicotine as a cognitive enhancer. Progress in Neuro-Psychopharmacology'
    ]
  },
  {
    id: 'habit_formation_day_9',
    title: 'Building Your New Identity',
    content: 'Every day you choose not to use nicotine, you\'re reinforcing your identity as someone who doesn\'t need it. You\'re not just breaking an old habit - you\'re becoming a new version of yourself.',
    scientificBasis: 'Identity-based habit change is more effective than outcome-based change. When we shift our self-concept, behaviors naturally align with our new identity, creating lasting change.',
    actionableAdvice: 'Start saying "I don\'t use nicotine" instead of "I\'m trying to quit." Notice how this feels different. Write down 3 qualities of your nicotine-free self and act on them today.',
    relevantDays: [9],
    category: 'psychology',
    icon: 'person-outline',
    color: '#8B5CF6',
    sources: [
      'Clear, J. (2018). Atomic Habits: Identity-based habits',
      'Klayman, J. (1995). Varieties of confirmation bias. Psychology of Learning and Motivation'
    ]
  },
  {
    id: 'social_confidence_day_10',
    title: 'Rediscovering Social Confidence',
    content: 'You might notice social situations feel different without nicotine as a social crutch. This is an opportunity to develop authentic confidence and discover that you\'re naturally interesting and engaging.',
    scientificBasis: 'Many people use nicotine to manage social anxiety, but this creates dependence rather than building genuine social skills. Recovery allows for the development of authentic social confidence.',
    actionableAdvice: 'Practice one genuine conversation today without thinking about nicotine. Focus on listening actively and asking questions. Notice that your natural personality is enough - you don\'t need substances to be likeable.',
    relevantDays: [10],
    category: 'psychology',
    icon: 'people-outline',
    color: '#06B6D4',
    sources: [
      'Kassel, J.D. (2003). Smoking, stress, and negative affect. Journal of Abnormal Psychology',
      'Morissette, S.B. (2007). Anxiety, anxiety disorders, and tobacco use. Anxiety Disorders'
    ]
  },
  {
    id: 'lung_healing_day_11',
    title: 'Your Lungs are Cleaning Themselves',
    content: 'Your lung cilia (tiny hair-like structures) are regenerating and beginning to clear out toxins. You might cough more as your lungs expel accumulated tar and debris - this is healing, not harm.',
    scientificBasis: 'Cigarette smoke paralyzes and destroys cilia, the lung\'s natural cleaning system. Within 2-12 weeks of cessation, cilia regenerate and lung function begins to improve significantly.',
    actionableAdvice: 'Support lung healing with deep breathing exercises. Try the "box breathing" technique: inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 5 times. Stay hydrated to help thin mucus.',
    relevantDays: [11],
    category: 'health',
    icon: 'fitness-outline',
    color: '#10B981',
    sources: [
      'Rennard, S.I. (2006). Treatment of tobacco use and dependence. Chest',
      'Willemse, B.W. (2004). Effect of 1-year smoking cessation on airway inflammation. European Respiratory Journal'
    ]
  },
  {
    id: 'focus_improvement_day_12',
    title: 'Your Natural Focus is Returning',
    content: 'While nicotine seemed to help concentration, it actually created a cycle of focus and distraction. Your brain is now learning to maintain attention naturally, building stronger, more sustainable concentration.',
    scientificBasis: 'Nicotine provides temporary cognitive enhancement followed by withdrawal-induced cognitive impairment. True cognitive improvement occurs as the brain learns to function optimally without external stimulation.',
    actionableAdvice: 'Practice focused attention with the "Pomodoro Technique": work for 25 minutes with full focus, then take a 5-minute break. Notice how your natural attention span is improving without artificial stimulation.',
    relevantDays: [12],
    category: 'neuroplasticity',
    icon: 'eye-outline',
    color: '#8B5CF6',
    sources: [
      'Heishman, S.J. (2010). Meta-analysis of the acute effects of nicotine. Psychopharmacology',
      'Mendrek, A. (2006). Working memory in cigarette smokers. Psychopharmacology'
    ]
  },
  {
    id: 'mood_stabilization_day_13',
    title: 'Your Emotions are Finding Balance',
    content: 'Mood swings are normal during recovery as your brain rebalances neurotransmitters. Each day, your emotional regulation improves. You\'re developing resilience that will serve you far beyond nicotine recovery.',
    scientificBasis: 'Nicotine disrupts natural neurotransmitter production including serotonin, dopamine, and GABA. Recovery involves the gradual restoration of natural mood regulation systems.',
    actionableAdvice: 'Track your mood daily on a 1-10 scale. Notice patterns and triggers. When emotions feel intense, remember they\'re temporary and part of healing. Practice self-compassion - you\'re doing something incredibly difficult.',
    relevantDays: [13],
    category: 'psychology',
    icon: 'happy-outline',
    color: '#EC4899',
    sources: [
      'Glassman, A.H. (1990). Cigarette smoking, major depression, and schizophrenia. Clinical Neuropharmacology',
      'Breslau, N. (1998). Major depression and stages of smoking. Archives of General Psychiatry'
    ]
  },
  {
    id: 'two_week_milestone_day_14',
    title: 'Two Weeks: Your Brain Chemistry is Shifting',
    content: 'Two weeks represents a major neurological milestone. Your dopamine receptors are significantly more sensitive, and your brain is producing more natural feel-good chemicals. The foundation of lasting recovery is being built.',
    scientificBasis: 'Research shows significant improvements in dopamine receptor sensitivity and natural neurotransmitter production occur around the 2-week mark, creating a foundation for long-term recovery success.',
    actionableAdvice: 'Celebrate this major milestone! Calculate how much money you\'ve saved and plan something special. Reflect on the positive changes you\'ve noticed. You\'ve proven you can create lasting change.',
    relevantDays: [14],
    category: 'motivation',
    icon: 'ribbon-outline',
    color: '#F59E0B',
    sources: [
      'Cosgrove, K.P. (2009). Evolving knowledge of sex differences in brain structure. Biological Psychiatry',
      'Staley, J.K. (2006). Human tobacco smokers in early abstinence. American Journal of Psychiatry'
    ]
  },

  // DAYS 15-21: STRENGTHENING - Building resilience and new patterns
  {
    id: 'stress_resilience_day_15',
    title: 'Building Unshakeable Stress Resilience',
    content: 'You\'re developing real stress management skills that don\'t depend on substances. Each stressful situation you handle without nicotine makes you stronger and more confident in your ability to cope.',
    scientificBasis: 'Chronic stress management without substances builds genuine resilience by strengthening the prefrontal cortex and improving emotional regulation pathways in the brain.',
    actionableAdvice: 'Create a "stress toolkit": deep breathing, progressive muscle relaxation, brief meditation, or calling a friend. Practice these when you\'re calm so they\'re ready when you need them.',
    relevantDays: [15],
    category: 'psychology',
    icon: 'shield-outline',
    color: '#3B82F6',
    sources: [
      'McEwen, B.S. (2007). Physiology and neurobiology of stress. Annual Review of Psychology',
      'Lupien, S.J. (2009). Effects of stress throughout the lifespan. Nature Reviews Neuroscience'
    ]
  },
  {
    id: 'immune_system_day_16',
    title: 'Your Immune System is Strengthening',
    content: 'Your immune system, suppressed by nicotine, is bouncing back. You might notice you\'re getting sick less often or recovering faster. Your body is remembering how to protect itself naturally.',
    scientificBasis: 'Nicotine suppresses immune function by reducing white blood cell activity and inflammatory responses. Cessation allows immune system recovery, improving resistance to infections and diseases.',
    actionableAdvice: 'Support your recovering immune system with adequate sleep, nutritious foods, regular exercise, and stress management. Notice how your body feels stronger and more resilient each day.',
    relevantDays: [16],
    category: 'health',
    icon: 'shield-checkmark-outline',
    color: '#10B981',
    sources: [
      'Sopori, M. (2002). Effects of cigarette smoke on the immune system. Nature Reviews Immunology',
      'Qiu, F. (2017). Impacts of cigarette smoking on immune responsiveness. Clinical Immunology'
    ]
  },
  {
    id: 'creativity_boost_day_17',
    title: 'Your Creativity is Flourishing',
    content: 'Without nicotine\'s rigid patterns, your brain is making new connections and associations. Many people discover increased creativity and problem-solving abilities during recovery.',
    scientificBasis: 'Addiction creates rigid neural pathways. Recovery promotes neuroplasticity and the formation of new neural networks, often leading to enhanced creativity and cognitive flexibility.',
    actionableAdvice: 'Try a creative activity today: draw, write, cook something new, or solve puzzles. Notice how your mind approaches problems differently. This mental flexibility is a gift of recovery.',
    relevantDays: [17],
    category: 'neuroplasticity',
    icon: 'bulb-outline',
    color: '#8B5CF6',
    sources: [
      'Koob, G.F. (2013). Negative reinforcement in drug addiction. Current Opinion in Neurobiology',
      'Kalivas, P.W. (2005). The neural basis of addiction. Nature Neuroscience'
    ]
  },
  {
    id: 'skin_improvement_day_18',
    title: 'Your Skin is Glowing with Health',
    content: 'Improved circulation and reduced toxin exposure are giving your skin a healthy glow. Collagen production is increasing, and your complexion is becoming clearer and more vibrant.',
    scientificBasis: 'Nicotine reduces blood flow to the skin and breaks down collagen. Cessation improves circulation, increases oxygen delivery to skin cells, and allows natural repair processes to resume.',
    actionableAdvice: 'Take a photo of yourself today and compare it to one from before you quit. Notice the improvements in your complexion, eye clarity, and overall appearance. Your health is literally glowing.',
    relevantDays: [18],
    category: 'health',
    icon: 'sunny-outline',
    color: '#F59E0B',
    sources: [
      'Morita, A. (2007). Tobacco smoke causes premature skin aging. Journal of Dermatological Science',
      'Freiman, A. (2004). Cutaneous effects of smoking. Journal of Cutaneous Medicine and Surgery'
    ]
  },
  {
    id: 'relationship_improvement_day_19',
    title: 'Your Relationships are Deepening',
    content: 'Without nicotine breaks interrupting conversations and activities, you\'re more present in your relationships. People notice when you\'re fully engaged, and connections naturally deepen.',
    scientificBasis: 'Addiction often creates barriers to authentic connection. Recovery allows for increased emotional availability, empathy, and genuine presence in relationships.',
    actionableAdvice: 'Have one meaningful conversation today where you\'re completely present - no thoughts about nicotine, just genuine connection. Notice how this feels different and more satisfying.',
    relevantDays: [19],
    category: 'psychology',
    icon: 'heart-outline',
    color: '#EC4899',
    sources: [
      'Leonard, K.E. (2005). Alcohol and intimate partner violence. Addiction',
      'Fals-Stewart, W. (2005). The occurrence of partner physical aggression. Psychology of Addictive Behaviors'
    ]
  },
  {
    id: 'exercise_capacity_day_20',
    title: 'Your Physical Performance is Soaring',
    content: 'Your lung capacity and cardiovascular efficiency are dramatically improved. Exercise feels easier, you recover faster, and your endurance is increasing. Your body is remembering what it feels like to be truly healthy.',
    scientificBasis: 'Nicotine cessation improves oxygen delivery, reduces inflammation, and enhances cardiovascular function. These changes significantly improve exercise capacity and physical performance.',
    actionableAdvice: 'Try a physical activity that would have been difficult before - climb stairs, take a longer walk, or try a new sport. Celebrate your body\'s amazing capacity for healing and strength.',
    relevantDays: [20],
    category: 'health',
    icon: 'barbell-outline',
    color: '#10B981',
    sources: [
      'Papathanasiou, G. (2007). Effects of smoking on cardiovascular function. Hellenic Journal of Cardiology',
      'Chelland Campbell, S. (2008). Smoking and smoking cessation. Respiratory Medicine'
    ]
  },
  {
    id: 'three_week_milestone_day_21',
    title: 'Three Weeks: Habits are Transforming',
    content: 'Three weeks is often cited as the time needed to begin forming new habits. You\'ve not only broken old patterns but started building new, healthier ones. Your brain has created new neural pathways that support your nicotine-free life.',
    scientificBasis: 'Research on habit formation shows that 21 days represents a critical period for establishing new neural pathways, though complete habit formation can take 66 days on average.',
    actionableAdvice: 'Reflect on the new habits you\'ve developed. What healthy routines have replaced nicotine use? Acknowledge how far you\'ve come and set intentions for the habits you want to strengthen further.',
    relevantDays: [21],
    category: 'motivation',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
    sources: [
      'Lally, P. (2010). How are habits formed: Modelling habit formation. European Journal of Social Psychology',
      'Gardner, B. (2012). Making health habitual. British Journal of General Practice'
    ]
  },

  // DAYS 22-30: MASTERY - Solidifying long-term success
  {
    id: 'confidence_building_day_22',
    title: 'Your Confidence is Unshakeable',
    content: 'You\'ve proven to yourself that you can overcome one of the most challenging addictions. This confidence extends beyond nicotine - you now know you can tackle any difficult challenge life presents.',
    scientificBasis: 'Successfully overcoming addiction builds self-efficacy, which generalizes to other areas of life. This increased confidence in one\'s ability to handle challenges is a powerful predictor of continued success.',
    actionableAdvice: 'Write down 3 other challenges in your life that seem more manageable now. Apply the same strategies you\'ve used for nicotine recovery: patience, persistence, and self-compassion.',
    relevantDays: [22],
    category: 'psychology',
    icon: 'trophy-outline',
    color: '#F59E0B',
    sources: [
      'Bandura, A. (1997). Self-efficacy: The exercise of control',
      'Marlatt, G.A. (2005). Relapse prevention: Maintenance strategies. Guilford Press'
    ]
  },
  {
    id: 'brain_optimization_day_23',
    title: 'Your Brain is Operating at Peak Efficiency',
    content: 'Your cognitive function is now significantly improved. Memory, attention, and decision-making are all enhanced. Your brain is operating without the constant interference of nicotine addiction.',
    scientificBasis: 'Long-term nicotine use impairs cognitive function through receptor desensitization and neurotransmitter imbalances. Recovery allows the brain to operate at its natural, optimized capacity.',
    actionableAdvice: 'Challenge your improved brain with learning something new: a language, skill, or hobby. Notice how much easier it is to focus and retain information. Your cognitive abilities are a gift of recovery.',
    relevantDays: [23],
    category: 'neuroplasticity',
    icon: 'library-outline',
    color: '#8B5CF6',
    sources: [
      'Swan, G.E. (2004). Cognitive performance in smokers and never-smokers. Addiction',
      'Durazzo, T.C. (2010). Smoking and increased Alzheimer\'s disease risk. Current Alzheimer Research'
    ]
  },
  {
    id: 'financial_freedom_day_24',
    title: 'Your Financial Future is Brighter',
    content: 'Calculate how much money you\'ve saved - it\'s probably more than you expected! This money can now go toward things that truly improve your life: experiences, health, relationships, or future goals.',
    scientificBasis: 'The average smoker spends thousands of dollars annually on cigarettes. Recovery provides immediate financial benefits that compound over time, significantly improving long-term financial health.',
    actionableAdvice: 'Calculate your annual savings and plan something meaningful with that money. Set up an automatic transfer to savings with the money you would have spent. Watch your wealth grow instead of going up in smoke.',
    relevantDays: [24],
    category: 'practical',
    icon: 'cash-outline',
    color: '#10B981',
    sources: [
      'CDC (2020). Economic Trends in Tobacco',
      'Campaign for Tobacco-Free Kids (2019). The Toll of Tobacco'
    ]
  },
  {
    id: 'role_model_day_25',
    title: 'You\'re Inspiring Others',
    content: 'Whether you realize it or not, your recovery journey is inspiring others. Friends, family, and even strangers notice your transformation and may be motivated to make positive changes in their own lives.',
    scientificBasis: 'Social modeling is a powerful force for behavior change. When people see others successfully overcome challenges, it increases their own self-efficacy and motivation to change.',
    actionableAdvice: 'Share your story with someone who might benefit from hearing it. You don\'t need to preach - simply living as an example of recovery is powerful. Your journey matters to more people than you know.',
    relevantDays: [25],
    category: 'motivation',
    icon: 'people-outline',
    color: '#06B6D4',
    sources: [
      'Bandura, A. (2001). Social cognitive theory. Annual Review of Psychology',
      'Christakis, N.A. (2007). The spread of obesity in a social network. New England Journal of Medicine'
    ]
  },
  {
    id: 'taste_smell_mastery_day_26',
    title: 'Your Senses are Fully Restored',
    content: 'Your taste and smell are now operating at full capacity. Food tastes incredible, scents are rich and complex, and you\'re experiencing the world with the full range of human sensory experience.',
    scientificBasis: 'Complete restoration of taste and smell typically occurs within 2-4 weeks of cessation. This sensory recovery enhances quality of life and can improve nutrition through increased enjoyment of healthy foods.',
    actionableAdvice: 'Try a food you haven\'t eaten in years, or visit a garden and really smell the flowers. Your enhanced senses are a daily reminder of your body\'s incredible ability to heal and thrive.',
    relevantDays: [26],
    category: 'health',
    icon: 'flower-outline',
    color: '#EC4899',
    sources: [
      'Vennemann, M.M. (2008). The association between smoking and taste impairment',
      'Frye, R.E. (1990). Cigarette smoking and olfactory function'
    ]
  },
  {
    id: 'stress_mastery_day_27',
    title: 'You\'ve Mastered Healthy Stress Management',
    content: 'You now have a toolkit of healthy stress management techniques that actually work better than nicotine ever did. You\'ve learned to face life\'s challenges with clarity, strength, and authentic coping skills.',
    scientificBasis: 'Healthy stress management techniques like deep breathing, exercise, and mindfulness create lasting positive changes in brain structure and function, unlike the temporary and ultimately harmful effects of nicotine.',
    actionableAdvice: 'List all the healthy stress management techniques you\'ve learned. Practice your favorite one today, even if you\'re not stressed. These skills are now part of who you are.',
    relevantDays: [27],
    category: 'psychology',
    icon: 'leaf-outline',
    color: '#10B981',
    sources: [
      'Goyal, M. (2014). Meditation programs for psychological stress. JAMA Internal Medicine',
      'Rosenbaum, S. (2014). Physical activity interventions for people with mental illness. Cochrane Reviews'
    ]
  },
  {
    id: 'identity_transformation_day_28',
    title: 'You Are a Different Person Now',
    content: 'You\'re not the same person who used nicotine. You\'ve developed new neural pathways, new habits, new confidence, and new ways of being in the world. This transformation goes far beyond just quitting nicotine.',
    scientificBasis: 'Neuroplasticity research shows that sustained behavior change literally rewires the brain, creating new neural networks that support the new identity and behaviors.',
    actionableAdvice: 'Write a letter to your past self from 28 days ago. What would you want them to know? What are you proud of? How have you grown? Acknowledge the profound transformation you\'ve undergone.',
    relevantDays: [28],
    category: 'psychology',
    icon: 'person-add-outline',
    color: '#8B5CF6',
    sources: [
      'Doidge, N. (2007). The Brain That Changes Itself',
      'Pascual-Leone, A. (2005). The plastic human brain cortex. Annual Review of Neuroscience'
    ]
  },
  {
    id: 'future_vision_day_29',
    title: 'Your Future is Limitless',
    content: 'With nicotine no longer controlling your decisions, you can pursue any goal, dream, or aspiration. Your health, wealth, relationships, and opportunities are all dramatically improved. The future is bright and entirely yours to create.',
    scientificBasis: 'Recovery from addiction opens up possibilities that were previously constrained by the need to maintain substance use. Improved health, cognitive function, and financial resources create opportunities for personal growth and achievement.',
    actionableAdvice: 'Write down 3 goals that feel more achievable now that you\'re nicotine-free. What dreams can you pursue with your improved health, saved money, and increased confidence? Start planning your amazing future.',
    relevantDays: [29],
    category: 'motivation',
    icon: 'rocket-outline',
    color: '#F59E0B',
    sources: [
      'Prochaska, J.O. (2008). Decision making in the transtheoretical model. Medical Decision Making',
      'Miller, W.R. (2002). Motivational interviewing: Preparing people for change'
    ]
  },
  {
    id: 'one_month_mastery_day_30',
    title: 'One Month: You Are a Recovery Champion',
    content: 'Thirty days nicotine-free is a monumental achievement. You\'ve rewired your brain, transformed your health, and proven that you can overcome any challenge. You are living proof that recovery is possible and beautiful.',
    scientificBasis: 'One month represents significant neuroplastic changes, with most acute withdrawal symptoms resolved and new neural pathways well-established. This milestone predicts long-term success in recovery.',
    actionableAdvice: 'Celebrate this incredible milestone! Plan something special, share your success with loved ones, and reflect on how far you\'ve come. You\'ve not just quit nicotine - you\'ve become a person who doesn\'t need it. That\'s mastery.',
    relevantDays: [30],
    category: 'motivation',
    icon: 'medal-outline',
    color: '#F59E0B',
    sources: [
      'Hughes, J.R. (2003). Motivating and helping smokers to stop smoking. Journal of General Internal Medicine',
      'Fiore, M.C. (2008). Treating tobacco use and dependence: 2008 update. Clinical Practice Guideline'
    ]
  }
];

/**
 * Get today's tip based on user's recovery progress and product type
 */
export const getTodaysTip = (): DailyTip => {
  const state = store.getState();
  const stats = selectProgressStats(state);
  const daysClean = stats.daysClean || 0;
  
  console.log(`📚 Getting personalized daily tip for day ${daysClean}`);
  
  // Get personalized tips based on user's product type
  const personalizedTips = getPersonalizedDailyTips(daysClean);
  
  if (personalizedTips && personalizedTips.length > 0) {
    const tip = personalizedTips[0]; // Use the first (most relevant) tip
    console.log(`📚 Selected personalized tip: "${tip.title}" (${tip.category}) for day ${daysClean}`);
    
    // Convert PersonalizedDailyTip to DailyTip format
    return {
      id: tip.id,
      title: tip.title,
      content: tip.content,
      scientificBasis: tip.scientificBasis,
      actionableAdvice: tip.actionableAdvice,
      relevantDays: [tip.dayNumber],
      category: tip.category,
      icon: tip.icon,
      color: tip.color,
      sources: tip.sources,
      dayNumber: daysClean,
    };
  }
  
  // Fallback to generic tips if personalized tips aren't available
  console.log(`📚 Using fallback generic tip for day ${daysClean}`);
  
  // For days 1-30, show the specific tip for that day
  if (daysClean >= 1 && daysClean <= 30) {
    const tipForDay = DAILY_TIPS.find(tip => tip.relevantDays.includes(daysClean));
    if (tipForDay) {
      console.log(`📚 Selected fallback tip: "${tipForDay.title}" (${tipForDay.category}) for day ${daysClean}`);
      return { ...tipForDay, dayNumber: daysClean };
    }
  }
  
  // For users beyond 30 days, filter out milestone-specific tips
  if (daysClean > 30) {
    // Filter out tips that contain milestone language in title or content
    const milestoneKeywords = [
      'One Week', 'Two Weeks', 'Three Weeks', 'One Month',
      'day 3', 'Week:', 'Weeks:', 'Month:', 'milestone', 'Milestone'
    ];
    
    const generalTips = DAILY_TIPS.filter(tip => {
      const hasTimeReference = milestoneKeywords.some(keyword => 
        tip.title.includes(keyword) || tip.content.includes(keyword)
      );
      return !hasTimeReference;
    });
    
    console.log(`📚 Filtered ${DAILY_TIPS.length - generalTips.length} milestone-specific tips, ${generalTips.length} general tips available`);
    
    // Create a pattern that cycles through general tips but in a varied way
    const cyclePosition = (daysClean - 31) % generalTips.length;
    
    // Add some variation based on which "month" they're in
    const monthNumber = Math.floor((daysClean - 1) / 30);
    const offset = (monthNumber * 7) % generalTips.length; // Shift by 7 each month
    
    const tipIndex = (cyclePosition + offset) % generalTips.length;
    const selectedTip = generalTips[tipIndex];
    
    console.log(`📚 Selected tip: "${selectedTip.title}" (${selectedTip.category}) - filtered cycling (day ${daysClean}, month ${monthNumber + 1})`);
    
    return { ...selectedTip, dayNumber: daysClean };
  }
  
  // For day 0, show the first tip
  const selectedTip = DAILY_TIPS[0];
  console.log(`📚 Selected tip: "${selectedTip.title}" (${selectedTip.category}) - day 0`);
  
  return { ...selectedTip, dayNumber: daysClean };
};

/**
 * Get tip by ID
 */
export const getTipById = (id: string): DailyTip | null => {
  return DAILY_TIPS.find(tip => tip.id === id) || null;
};

/**
 * Get all available tips
 */
export const getAllTips = (): DailyTip[] => {
  return DAILY_TIPS;
};

/**
 * Check if user has viewed today's tip
 */
export const hasViewedTodaysTip = async (): Promise<boolean> => {
  try {
    const viewedDate = await AsyncStorage.getItem('lastViewedTipDate');
    if (!viewedDate) return false;
    
    const today = new Date().toDateString();
    const lastViewed = new Date(viewedDate).toDateString();
    
    return today === lastViewed;
  } catch (error) {
    console.error('Error checking viewed tip status:', error);
    return false;
  }
};

/**
 * Mark today's tip as viewed
 */
export const markTipAsViewed = async (tipId: string): Promise<void> => {
  try {
    const today = new Date().toISOString();
    await AsyncStorage.setItem('lastViewedTipDate', today);
    await AsyncStorage.setItem('lastViewedTipId', tipId);
    console.log(`📚 Tip viewed: ${tipId} on ${today}`);
  } catch (error) {
    console.error('Error marking tip as viewed:', error);
  }
};

export default {
  getTodaysTip,
  getTipById,
  getAllTips,
  hasViewedTodaysTip,
  markTipAsViewed,
}; 