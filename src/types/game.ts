export type SkinId = 
  | 'honey_berry'
  | 'rainbow_candy'
  | 'ocean_swirl'
  | 'frost_snowman'
  | 'strawberry_lime'
  | 'cosmic_violet'
  | 'golden_imperial'
  | 'shadow_skull'
  | 'cyber_cobra'
  | 'golden_dragon'
  | 'skeleton_shadow'
  | 'cyber_beast'
  | 'lava_hydra'
  | 'cosmic_nebula'
  | 'neon_viper'
  | 'crimson_fury';

export type HeadType = 'cute_eyes' | 'snowman_hat' | 'rainbow_smile' | 'dragon_horns' | 'skull_eyes' | 'crown';

export interface SkinDefinition {
  id: SkinId;
  nameAr: string;
  nameEn: string;
  primaryColor: string;
  secondaryColor: string;
  stripeColor: string;
  glowColor: string;
  headType: HeadType;
  pattern: 'stripes' | 'rainbow' | 'swirl' | 'dots' | 'scales';
  eyeColor: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  descriptionAr: string;
  previewImage?: string;
}

export type FoodType = 
  | 'donut'
  | 'wrapped_candy'
  | 'heart_choco'
  | 'flower_cookie'
  | 'jelly_cube'
  | 'lemon_slice'
  | 'lollipop'
  | 'dot';

export type GameMode = 'crash_arena' | 'team_battle' | 'classic' | 'turbo_blitz';

export type TeamId = 'red' | 'blue' | 'none';

export interface ModeInfo {
  id: GameMode;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  speedMultiplier: number;
}

export type PowerUpType = 'magnet' | 'shield' | 'hyper_boost' | 'double_score';

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  radius: number;
  color: string;
  pulsePhase: number;
}

export interface PlayerProfile {
  id: string;
  username: string;
  isGuest: boolean;
  avatar: string;
  skinId: SkinId;
  trophies: number;
  highestScore: number;
  totalKills: number;
  totalGames: number;
  rankTitle: string;
  serverRegion: 'me_dubai' | 'eu_frankfurt' | 'us_east' | 'asia_singapore';
}

export interface Segment {
  x: number;
  y: number;
}

export interface Snake {
  id: string;
  name: string;
  isBot: boolean;
  isPlayer: boolean;
  skinId: SkinId;
  team: TeamId;
  headType: HeadType;
  primaryColor: string;
  secondaryColor: string;
  stripeColor: string;
  glowColor: string;
  x: number;
  y: number;
  angle: number;
  targetAngle: number;
  speed: number;
  baseSpeed: number;
  isBoosting: boolean;
  segments: Segment[];
  targetLength: number;
  radius: number;
  alive: boolean;
  score: number;
  kills: number;
  boostStamina: number;
  aiTurnTimer?: number;
  hasShield?: boolean;
  countryCode?: string;
  activePowerUps?: Partial<Record<PowerUpType, number>>;
}

export interface Pellet {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  value: number;
  foodType: FoodType;
  rotation?: number;
  isSuper?: boolean;
}

export interface CrashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  subText?: string;
  color: string;
  alpha: number;
  life: number;
  scale?: number;
}

export interface KillEvent {
  id: string;
  killer: string;
  victim: string;
  time: number;
  points: number;
  killerColor: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  kills: number;
  isPlayer: boolean;
  color: string;
  team?: TeamId;
  flag?: string;
}

export const SKINS_DATA: Record<SkinId, SkinDefinition> = {
  honey_berry: {
    id: 'honey_berry',
    nameAr: 'العسل والتوت المخطط',
    nameEn: 'Honey & Berry',
    primaryColor: '#f59e0b',
    secondaryColor: '#ec4899',
    stripeColor: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    headType: 'cute_eyes',
    pattern: 'stripes',
    eyeColor: '#0f172a',
    rarity: 'Common',
    descriptionAr: 'ثعبان محبوب بخطوط صفراء وفوشيا وعيون كرتونية معبرة (مثل الصورة 1)',
  },
  rainbow_candy: {
    id: 'rainbow_candy',
    nameAr: 'قوس قزح الحلوى اللامع',
    nameEn: 'Rainbow Candy',
    primaryColor: '#00f0ff',
    secondaryColor: '#f43f5e',
    stripeColor: '#facc15',
    glowColor: 'rgba(56, 189, 248, 0.7)',
    headType: 'rainbow_smile',
    pattern: 'rainbow',
    eyeColor: '#0284c7',
    rarity: 'Legendary',
    descriptionAr: 'ألوان الطيف المبهجة مع عيون كرتونية لامعة (مثل الصورة 3)',
  },
  frost_snowman: {
    id: 'frost_snowman',
    nameAr: 'رجل الجليد الفضي',
    nameEn: 'Frost Snowman',
    primaryColor: '#f8fafc',
    secondaryColor: '#475569',
    stripeColor: '#e2e8f0',
    glowColor: 'rgba(248, 250, 252, 0.8)',
    headType: 'snowman_hat',
    pattern: 'stripes',
    eyeColor: '#0f172a',
    rarity: 'Epic',
    descriptionAr: 'جسم أبيض فضي أنيق وقبعة احتفالية لطيفة (مثل الصورة 2)',
  },
  ocean_swirl: {
    id: 'ocean_swirl',
    nameAr: 'تموجات المحيط الأزرق',
    nameEn: 'Ocean Swirl',
    primaryColor: '#3b82f6',
    secondaryColor: '#93c5fd',
    stripeColor: '#1d4ed8',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    headType: 'cute_eyes',
    pattern: 'stripes',
    eyeColor: '#1e3a8a',
    rarity: 'Rare',
    descriptionAr: 'خطوط زرقاء وبيضاء ثلاثية الأبعاد بلمعان مائي جذاب',
  },
  strawberry_lime: {
    id: 'strawberry_lime',
    nameAr: 'الفراولة والليمون الأخضر',
    nameEn: 'Strawberry Lime',
    primaryColor: '#ef4444',
    secondaryColor: '#22c55e',
    stripeColor: '#f87171',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    headType: 'cute_eyes',
    pattern: 'stripes',
    eyeColor: '#0f172a',
    rarity: 'Common',
    descriptionAr: 'ألوان فاكهية زاهية مع حواف ناعمة مضيئة',
  },
  cosmic_violet: {
    id: 'cosmic_violet',
    nameAr: 'سديم الحلوى البنفسجي',
    nameEn: 'Cosmic Violet',
    primaryColor: '#a855f7',
    secondaryColor: '#f472b6',
    stripeColor: '#c084fc',
    glowColor: 'rgba(168, 85, 247, 0.7)',
    headType: 'cute_eyes',
    pattern: 'swirl',
    eyeColor: '#581c87',
    rarity: 'Rare',
    descriptionAr: 'بنفسجي متدرج ووردي مع لمعان ساحر',
  },
  golden_imperial: {
    id: 'golden_imperial',
    nameAr: 'التنين الذهبي الأسطوري',
    nameEn: 'Golden Imperial',
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
    stripeColor: '#fef08a',
    glowColor: 'rgba(234, 179, 8, 0.75)',
    headType: 'dragon_horns',
    pattern: 'scales',
    eyeColor: '#15803d',
    rarity: 'Legendary',
    descriptionAr: 'حراشف ذهبية ملكية مع قرون تنين وتاج النصر',
  },
  shadow_skull: {
    id: 'shadow_skull',
    nameAr: 'الجمجمة الشبحية اللامعة',
    nameEn: 'Shadow Ghost Skull',
    primaryColor: '#06b6d4',
    secondaryColor: '#1e293b',
    stripeColor: '#22d3ee',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    headType: 'skull_eyes',
    pattern: 'stripes',
    eyeColor: '#00f0ff',
    rarity: 'Epic',
    descriptionAr: 'خطوط سيان ليزرية مع عيون جمجمة متوهجة',
  },
  cyber_cobra: {
    id: 'cyber_cobra',
    nameAr: 'كوبرا السايبر النيون',
    nameEn: 'Cyber Cobra',
    primaryColor: '#06b6d4',
    secondaryColor: '#7c3aed',
    stripeColor: '#22d3ee',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    headType: 'cute_eyes',
    pattern: 'stripes',
    eyeColor: '#ffffff',
    rarity: 'Epic',
    descriptionAr: 'رأس كوبرا مع توهج نيون',
  },
  golden_dragon: {
    id: 'golden_dragon',
    nameAr: 'التنين الإمبراطوري الذهبي',
    nameEn: 'Golden Dragon',
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
    stripeColor: '#fef08a',
    glowColor: 'rgba(234, 179, 8, 0.75)',
    headType: 'dragon_horns',
    pattern: 'scales',
    eyeColor: '#15803d',
    rarity: 'Legendary',
    descriptionAr: 'حراشف ذهبية ملكية مع قرون تنين',
  },
  skeleton_shadow: {
    id: 'skeleton_shadow',
    nameAr: 'الهيكل العظمي المشع',
    nameEn: 'Shadow Skeleton',
    primaryColor: '#00f0ff',
    secondaryColor: '#334155',
    stripeColor: '#38bdf8',
    glowColor: 'rgba(0, 240, 255, 0.75)',
    headType: 'skull_eyes',
    pattern: 'stripes',
    eyeColor: '#00f0ff',
    rarity: 'Legendary',
    descriptionAr: 'رأس جمجمة مرعبة مع فقرات متوهجة',
  },
  cyber_beast: {
    id: 'cyber_beast',
    nameAr: 'التنين الآلي الهائج',
    nameEn: 'Mecha Cyber Dragon',
    primaryColor: '#f59e0b',
    secondaryColor: '#1e293b',
    stripeColor: '#fbbf24',
    glowColor: 'rgba(245, 158, 11, 0.8)',
    headType: 'dragon_horns',
    pattern: 'scales',
    eyeColor: '#fef08a',
    rarity: 'Legendary',
    descriptionAr: 'رأس تنين ميكانيكي بقرون نارية',
  },
  lava_hydra: {
    id: 'lava_hydra',
    nameAr: 'أفعى الحمم البركانية',
    nameEn: 'Volcanic Lava Hydra',
    primaryColor: '#ef4444',
    secondaryColor: '#7f1d1d',
    stripeColor: '#f87171',
    glowColor: 'rgba(239, 68, 68, 0.8)',
    headType: 'cute_eyes',
    pattern: 'stripes',
    eyeColor: '#fef08a',
    rarity: 'Epic',
    descriptionAr: 'حمم منصهرة تسري داخل العروق',
  },
  cosmic_nebula: {
    id: 'cosmic_nebula',
    nameAr: 'أفعى السديم الكوني',
    nameEn: 'Cosmic Nebula',
    primaryColor: '#c084fc',
    secondaryColor: '#3b82f6',
    stripeColor: '#e9d5ff',
    glowColor: 'rgba(192, 132, 252, 0.75)',
    headType: 'cute_eyes',
    pattern: 'swirl',
    eyeColor: '#38bdf8',
    rarity: 'Rare',
    descriptionAr: 'ألوان المجرات البنفسجية والزرقاء',
  },
  neon_viper: {
    id: 'neon_viper',
    nameAr: 'أفعى النيون الفسفورية',
    nameEn: 'Neon Viper',
    primaryColor: '#10b981',
    secondaryColor: '#064e3b',
    stripeColor: '#34d399',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    headType: 'cute_eyes',
    pattern: 'stripes',
    eyeColor: '#facc15',
    rarity: 'Common',
    descriptionAr: 'توهج فسفوري مشع في الظلام',
  },
  crimson_fury: {
    id: 'crimson_fury',
    nameAr: 'اللهب القرمزي السريع',
    nameEn: 'Crimson Fury',
    primaryColor: '#f43f5e',
    secondaryColor: '#881337',
    stripeColor: '#fb7185',
    glowColor: 'rgba(244, 63, 94, 0.7)',
    headType: 'cute_eyes',
    pattern: 'stripes',
    eyeColor: '#ffffff',
    rarity: 'Common',
    descriptionAr: 'خطوط حمراء براقة',
  },
};

export const BOT_NAMES_WITH_FLAGS = [
  { name: 'خالد محي الدين', flag: '🇸🇦' },
  { name: 'zaid abu zahia', flag: '🇯🇴' },
  { name: 'وجدي غازي', flag: '🇪🇬' },
  { name: 'Mageed Alyousif', flag: '🇦🇪' },
  { name: 'Emon Maryam', flag: '🇲🇦' },
  { name: 'Ahmed Height', flag: '🇰🇼' },
  { name: 'Arwa Sahraoui', flag: '🇩🇿' },
  { name: 'Today boy', flag: '🇬🇧' },
  { name: 'DrMehmood', flag: '🇵🇰' },
  { name: 'أحمد عصام', flag: '🇶🇦' },
  { name: 'Merna Hussein', flag: '🇪🇬' },
  { name: 'rania rachid', flag: '🇹🇳' },
  { name: 'Sadan Du', flag: '🇨🇳' },
  { name: 'Nihad Minoz', flag: '🇫🇷' },
  { name: 'Loubna Amira', flag: '🇱🇧' },
];

export const SERVERS = [
  { id: 'me_dubai', nameAr: 'الشرق الأوسط (دبي)', nameEn: 'Middle East (Dubai)', ping: 18, status: 'ممتاز' },
  { id: 'eu_frankfurt', nameAr: 'أوروبا (فرانكفورت)', nameEn: 'Europe (Frankfurt)', ping: 42, status: 'جيد جداً' },
  { id: 'us_east', nameAr: 'أمريكا الشرقية (فرجينيا)', nameEn: 'US East (N. Virginia)', ping: 110, status: 'مستقر' },
  { id: 'asia_singapore', nameAr: 'آسيا (سنغافورة)', nameEn: 'Asia (Singapore)', ping: 85, status: 'جيد' },
];
