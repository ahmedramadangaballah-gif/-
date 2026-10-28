import React, { useState } from 'react';
import { GameMode, ModeInfo, PlayerProfile, SkinId, SKINS_DATA, TeamId, SERVERS } from '../types/game';
import { sounds } from '../services/sound';
import {
  Play,
  UserCheck,
  User,
  Sparkles,
  Dices,
  Trophy,
  Zap,
  Swords,
  Infinity as InfinityIcon,
  Flame,
  Smartphone,
  Laptop,
  Globe,
  Volume2,
  VolumeX,
  Shield,
  Crown,
  Users,
  Magnet,
} from 'lucide-react';

interface LobbyProps {
  onStartGame: (name: string, skinId: SkinId, mode: GameMode, team?: TeamId) => void;
  playerProfile: PlayerProfile;
  onOpenLoginModal: () => void;
  onUpdateProfile: (profile: PlayerProfile) => void;
}

const MODES: ModeInfo[] = [
  {
    id: 'crash_arena',
    nameAr: 'حلبة التحطيم (Crash Arena)',
    nameEn: 'Crash Arena',
    descAr: 'المعركة الفردية الأكثر شراسة! تحطم الخصوم وتناول بقاياهم المضيئة لتصبح أضخم ثعبان.',
    descEn: 'High intensity! Cut off rivals, devour their radiant remains, and dominate.',
    badgeAr: 'الأكثر شعبية 💥',
    badgeEn: 'Most Popular',
    speedMultiplier: 1.15,
  },
  {
    id: 'team_battle',
    nameAr: 'معركة الفرق (Team Battle 4v4)',
    nameEn: 'Team Battle 4v4',
    descAr: 'فريق الأزرق ضد الأحمر! الثعابين الصديقة لا تموت عند لمس بعضها ويمكنها محاصرة الأعداء معاً!',
    descEn: 'Red vs Blue! Friendly snakes never crash into each other and coordinate to encircle enemies.',
    badgeAr: 'جديد: لعب جماعي 🤝',
    badgeEn: 'New Team Mode',
    speedMultiplier: 1.15,
  },
  {
    id: 'turbo_blitz',
    nameAr: 'سباق السرعة (Turbo Blitz)',
    nameEn: 'Turbo Blitz',
    descAr: 'سرعة مضاعفة ومناورات خاطفة للمحترفين فقط. حركتك القادمة تحدد مصيرك!',
    descEn: 'Max velocity! Lightning-fast reflexes required to outrun rival cobras.',
    badgeAr: 'سرعة خارقة ⚡',
    badgeEn: 'High Speed',
    speedMultiplier: 1.35,
  },
  {
    id: 'classic',
    nameAr: 'النمط الكلاسيكي (Classic)',
    nameEn: 'Classic Endless',
    descAr: 'تمدد بدون قيود، نافس في قائمة المتصدرين واستمتع بنمو أسطوري هادئ بدون اصطدام ذاتي.',
    descEn: 'Endless growth and calm tactical maneuvering across the infinite arena.',
    badgeAr: 'كلاسيكي 🌟',
    badgeEn: 'Endless',
    speedMultiplier: 1.0,
  },
];

const RANDOM_NICKNAMES = [
  'الهيكل_المرعب',
  'التنين_الأسطوري',
  'الكوبرا_السامة',
  'صقر_الصحراء',
  'العاصفة_الزرقاء',
  'الشبح_الخاطف',
  'سلطان_الحلبة',
  'CyberViper',
  'BoneCrusher',
  'ApexDragon',
  'DesertStorm',
  'البرق_السريع',
  'الوحش_الكاسر',
];

export const Lobby: React.FC<LobbyProps> = ({
  onStartGame,
  playerProfile,
  onOpenLoginModal,
  onUpdateProfile,
}) => {
  const [nickname, setNickname] = useState(playerProfile.username);
  const [selectedSkin, setSelectedSkin] = useState<SkinId>(playerProfile.skinId);
  const [selectedMode, setSelectedMode] = useState<GameMode>('crash_arena');
  const [selectedTeam, setSelectedTeam] = useState<TeamId>('blue');
  const [activeTab, setActiveTab] = useState<'lobby' | 'skins' | 'leaderboard' | 'controls'>('lobby');
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const handleRandomizeName = () => {
    sounds.playClick();
    const random = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    setNickname(random);
    onUpdateProfile({ ...playerProfile, username: random });
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handlePlayGuest = () => {
    sounds.playClick();
    const validName = nickname.trim() || 'ضيف_الحلبة';
    onUpdateProfile({ ...playerProfile, username: validName, isGuest: true, skinId: selectedSkin });
    onStartGame(validName, selectedSkin, selectedMode, selectedTeam);
  };

  const handlePlayOnline = () => {
    sounds.playClick();
    if (playerProfile.isGuest) {
      onOpenLoginModal();
    } else {
      const validName = nickname.trim() || playerProfile.username;
      onStartGame(validName, selectedSkin, selectedMode, selectedTeam);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-8">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-rose-500 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
            </div>
          </div>
          <span className="text-lg md:text-xl font-black tracking-tight text-white">
            SNAKE <span className="text-cyan-400">CRASH</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('lobby');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'lobby' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            حلبة القتال
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('skins');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'skins' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            خزانة المظاهر والرؤوس
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('leaderboard');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'leaderboard' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            قائمة الأبطال
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('controls');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'controls' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-0.5' : 'hover:text-white'
            }`}
          >
            دليل التحكم والمكافآت
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleSound}
            aria-label="تبديل الصوت"
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {playerProfile.isGuest ? (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenLoginModal();
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-xl hover:bg-slate-800 hover:text-cyan-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>تسجيل الدخول</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-700/60 rounded-xl">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-cyan-300 truncate max-w-[100px]">{playerProfile.username}</span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded">
                🏆 {playerProfile.trophies}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE SEGMENTED BAR */}
      <div className="md:hidden flex items-center justify-around bg-slate-900/90 border-b border-slate-800 px-2 py-1.5 text-xs font-semibold">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('lobby');
          }}
          className={`py-1 px-3 rounded-lg ${activeTab === 'lobby' ? 'bg-cyan-950 text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          الحلبة
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('skins');
          }}
          className={`py-1 px-3 rounded-lg ${activeTab === 'skins' ? 'bg-cyan-950 text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          المظاهر
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('leaderboard');
          }}
          className={`py-1 px-3 rounded-lg ${activeTab === 'leaderboard' ? 'bg-cyan-950 text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          الأبطال
        </button>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('controls');
          }}
          className={`py-1 px-3 rounded-lg ${activeTab === 'controls' ? 'bg-cyan-950 text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          التحكم
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        {activeTab === 'lobby' && (
          <div className="space-y-8">
            {/* HERO SECTION */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl">
              <div className="absolute inset-0 z-0">
                <img
                  src="/src/assets/images/snake_crash_arena_hero_1793228277230.jpg"
                  alt="Snake Crash Arena"
                  className="w-full h-full object-cover opacity-35"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
              </div>

              <div className="relative z-10 p-6 md:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4 text-right">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>سرعة خارقة وسلسة • آمن من الاصطدام الذاتي • معارك فرق 4v4</span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    سرعة خاطفة، حطّم خصومك، <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400">
                      وتربع على قمة الحلبة!
                    </span>
                  </h1>

                  <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl">
                    حركة سلسة ومحسنة مع تحكم مطلق: ثعبانك لا يموت أبداً عند لمس جسده، وفي طور الفرق يتعاون الأصدقاء لتطويق الخصوم واصطيادهم بكل أمان!
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                      <span>عصا لمس افتراضية للهاتف والتابلت</span>
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                      <Laptop className="w-4 h-4 text-indigo-400" />
                      <span>تحكم سلس بالفأرة أو الكيبورد للكمبيوتر</span>
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-6 shadow-2xl space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">اسم اللاعب في المعركة</label>
                      <button
                        type="button"
                        onClick={handleRandomizeName}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>اسم عشوائي</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="اكتب اسمك المستعار..."
                      maxLength={18}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {/* Skin Pill with Image / Icon */}
                  {(() => {
                    const activeSkin = SKINS_DATA[selectedSkin] || SKINS_DATA.honey_berry;
                    return (
                      <div className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl border border-white/20 shadow-sm flex items-center justify-center overflow-hidden bg-slate-900">
                            {activeSkin.previewImage ? (
                              <img
                                src={activeSkin.previewImage}
                                alt=""
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div
                                className="w-full h-full"
                                style={{ backgroundColor: activeSkin.primaryColor }}
                              />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{activeSkin.nameAr}</div>
                            <div className="text-[10px] text-cyan-400">{activeSkin.rarity} • {activeSkin.headType}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            sounds.playClick();
                            setActiveTab('skins');
                          }}
                          className="text-xs text-cyan-400 hover:underline font-bold px-2 py-1 cursor-pointer"
                        >
                          تغيير المظهر
                        </button>
                      </div>
                    );
                  })()}

                  {/* Team Selector if Team Battle is active */}
                  {selectedMode === 'team_battle' && (
                    <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                      <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>اختر فريقك (الحلفاء لا يموتون عند الاصطدام):</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedTeam('blue');
                          }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            selectedTeam === 'blue'
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-2 ring-blue-400'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <span>🔵 الفريق الأزرق</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setSelectedTeam('red');
                          }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            selectedTeam === 'red'
                              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
                              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <span>🔴 الفريق الأحمر</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dual Action CTA Buttons */}
                  <div className="space-y-3 pt-1">
                    <button
                      onClick={handlePlayGuest}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base rounded-xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                      <span>دخول مباشر واللعب كزائر (Play as Guest)</span>
                    </button>

                    <button
                      onClick={handlePlayOnline}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600/80 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-cyan-400"
                    >
                      {playerProfile.isGuest ? (
                        <>
                          <UserCheck className="w-4 h-4 text-cyan-400" />
                          <span>تسجيل الدخول للعب أونلاين وحفظ النقاط</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 text-cyan-400" />
                          <span>دخول بالحساب: {playerProfile.username} ({playerProfile.rankTitle})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GAME MODES SELECTOR */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-white">اختر نمط اللعبة</h2>
                  <p className="text-xs text-slate-400">حدد نوع المنافسة المناسبة لأسلوب لعبك قبل بدء المعركة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedMode(mode.id);
                    }}
                    className={`p-5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                      selectedMode === mode.id
                        ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/50 ring-1 ring-cyan-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          {mode.id === 'crash_arena' ? (
                            <Swords className="w-6 h-6 text-rose-400" />
                          ) : mode.id === 'team_battle' ? (
                            <Users className="w-6 h-6 text-blue-400" />
                          ) : mode.id === 'turbo_blitz' ? (
                            <Flame className="w-6 h-6 text-amber-400" />
                          ) : (
                            <InfinityIcon className="w-6 h-6 text-emerald-400" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {mode.badgeAr}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white mb-1.5">{mode.nameAr}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{mode.descAr}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">معدل السرعة</span>
                      <span className="font-mono font-bold text-cyan-300">x{mode.speedMultiplier}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SKINS & HEAD CUSTOMIZER TAB */}
        {activeTab === 'skins' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">خزانة مظاهر ورؤوس الثعابين المتوهجة</h2>
                <p className="text-xs text-slate-400">هياكل عظمية، تنانين أسطورية، وحوش آلية، وكوبرا سيبرانية مع تأثيرات توهج خارقة</p>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('lobby');
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                تأكيد والعودة للحلبة
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(Object.keys(SKINS_DATA) as SkinId[]).map((id) => {
                const skin = SKINS_DATA[id];
                const isSelected = selectedSkin === id;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedSkin(id);
                      onUpdateProfile({ ...playerProfile, skinId: id });
                    }}
                    className={`relative rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-xl ring-2 ring-cyan-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center mb-3">
                      {skin.previewImage ? (
                        <img
                          src={skin.previewImage}
                          alt={skin.nameAr}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center relative p-3">
                          {/* Cute 3D Cartoon Snake Preview */}
                          <div className="relative flex items-center justify-center">
                            {/* Segment Body Beads */}
                            <div className="flex items-center -space-x-2">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                  key={i}
                                  className="w-10 h-10 rounded-full shadow-lg border-2 border-white/20 relative"
                                  style={{
                                    backgroundColor: i % 2 === 0 ? skin.primaryColor : skin.secondaryColor,
                                    transform: `translateY(${Math.sin(i * 0.8) * 8}px)`,
                                  }}
                                >
                                  <div className="absolute top-1 left-1.5 w-4 h-2 rounded-full bg-white/40" />
                                </div>
                              ))}
                              {/* Big Cute Head */}
                              <div
                                className="w-13 h-13 rounded-full shadow-2xl border-2 border-white/40 relative flex items-center justify-center z-10"
                                style={{ backgroundColor: skin.primaryColor }}
                              >
                                <div className="absolute top-1 left-2 w-6 h-3 rounded-full bg-white/40" />
                                {/* Big Expressive Eyes */}
                                <div className="flex items-center gap-1.5">
                                  <div className="w-4.5 h-4.5 rounded-full bg-white shadow-sm flex items-center justify-center relative">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 absolute right-0.5">
                                      <div className="w-1 h-1 rounded-full bg-white top-0.5 left-0.5 absolute" />
                                    </div>
                                  </div>
                                  <div className="w-4.5 h-4.5 rounded-full bg-white shadow-sm flex items-center justify-center relative">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 absolute right-0.5">
                                      <div className="w-1 h-1 rounded-full bg-white top-0.5 left-0.5 absolute" />
                                    </div>
                                  </div>
                                </div>
                                {/* Blush cheeks */}
                                <div className="absolute -bottom-0.5 flex gap-5">
                                  <div className="w-2.5 h-1.5 rounded-full bg-rose-400/70" />
                                  <div className="w-2.5 h-1.5 rounded-full bg-rose-400/70" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-bold text-white">
                        {skin.rarity}
                      </div>

                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-cyan-950/80 text-[10px] font-bold text-cyan-300">
                        رأس {skin.headType}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-base font-black text-white">{skin.nameAr}</h4>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: skin.primaryColor }} />
                          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: skin.secondaryColor }} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{skin.descriptionAr}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ المظهر المفعل حالياً' : 'تفعيل هذا المظهر'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-amber-950/50 border border-amber-800/40 mb-2">
                <Crown className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-black text-white">قائمة أبطال الحلبة العالمية</h2>
              <p className="text-xs text-slate-400">أعلى اللاعبين نقاطاً وبطولات في خوادم Snake Crash</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>الترتيب واللاعب</span>
                <div className="flex items-center gap-6">
                  <span>التحطيم</span>
                  <span>النقاط</span>
                </div>
              </div>

              <div className="divide-y divide-slate-800/60">
                {[
                  { rank: 1, name: 'سلطان_الحلبة', score: '94,220', kills: 48, title: 'الأسطورة الخالدة', color: '#f59e0b' },
                  { rank: 2, name: 'DragonEmperor_99', score: '82,450', kills: 41, title: 'قاهر التنانين', color: '#facc15' },
                  { rank: 3, name: 'BoneCrusher_VIP', score: '74,180', kills: 36, title: 'سيد الهياكل', color: '#00f0ff' },
                  { rank: 4, name: 'صقر_الصحراء', score: '63,180', kills: 31, title: 'الفهد الليلي', color: '#10b981' },
                  { rank: 5, name: 'ViperShadow', score: '54,220', kills: 27, title: 'سفاح النيون', color: '#a855f7' },
                ].map((hero) => (
                  <div key={hero.rank} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                          hero.rank === 1
                            ? 'bg-amber-500 text-slate-950'
                            : hero.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : hero.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {hero.rank}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{hero.name}</span>
                          <span className="text-[10px] text-cyan-400 font-normal">({hero.title})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-xs">
                      <span className="text-rose-400 font-bold tabular-nums">{hero.kills}</span>
                      <span className="text-amber-300 font-bold tabular-nums text-sm">{hero.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTROLS & POWER-UPS GUIDE TAB */}
        {activeTab === 'controls' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white">دليل التحكم وقدرات الحلبة الخارقة</h2>
              <p className="text-xs text-slate-400">استفد من المكافآت المتساقطة في الحلبة لتفوز بالصدارة</p>
            </div>

            {/* Powerups grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-cyan-800/50 p-4 rounded-2xl text-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 mx-auto flex items-center justify-center mb-2">
                  <Magnet className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="text-sm font-bold text-white">مغناطيس الطاقة</h4>
                <p className="text-[11px] text-slate-400 mt-1">يجذب كل كرات الطاقة المحيطة لمسافة 350px نحوك تلقائياً</p>
              </div>

              <div className="bg-slate-900 border border-blue-800/50 p-4 rounded-2xl text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/40 mx-auto flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-sm font-bold text-white">درع الحماية</h4>
                <p className="text-[11px] text-slate-400 mt-1">يحميك من التحطم إذا اصطدمت بعدو ويدفعه بعيداً</p>
              </div>

              <div className="bg-slate-900 border border-amber-800/50 p-4 rounded-2xl text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/40 mx-auto flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-white">توربو خارق</h4>
                <p className="text-[11px] text-slate-400 mt-1">سرعة تسريع لا نهائية لمدة 6 ثوانٍ دون استهلاك أي طاقة</p>
              </div>

              <div className="bg-slate-900 border border-emerald-800/50 p-4 rounded-2xl text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 mx-auto flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-white">مضاعف النقاط x2</h4>
                <p className="text-[11px] text-slate-400 mt-1">يضاعف كافة النقاط المكتسبة من كرات الطاقة لمدة 10 ثوانٍ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800">
                    <Laptop className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">أجهزة الكمبيوتر (PC / Mac)</h3>
                    <span className="text-xs text-slate-400">تحكم بالماوس أو لوحة المفاتيح</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl">
                    <span className="text-slate-300 font-semibold">توجيه الثعبان</span>
                    <span className="font-mono text-cyan-400 bg-slate-800 px-2 py-1 rounded">حركة مؤشر الفأرة (Mouse)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl">
                    <span className="text-slate-300 font-semibold">التسريع الفائق (Turbo)</span>
                    <span className="font-mono text-rose-400 bg-slate-800 px-2 py-1 rounded">Space أو زر الفأرة</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl">
                    <span className="text-slate-300 font-semibold">الاصطدام الذاتي</span>
                    <span className="font-mono text-emerald-400 bg-slate-800 px-2 py-1 rounded">آمن تماماً (لا تموت إذا لمست جسدك)</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="p-3 rounded-xl bg-indigo-950 border border-indigo-800">
                    <Smartphone className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">الهواتف والأجهزة اللوحية</h3>
                    <span className="text-xs text-slate-400">لمس افتراضي سريع 60FPS</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl">
                    <span className="text-slate-300 font-semibold">عصا التوجيه</span>
                    <span className="font-mono text-indigo-400 bg-slate-800 px-2 py-1 rounded">اسحب إصبعك في أي مكان على اليسار</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl">
                    <span className="text-slate-300 font-semibold">زر التوربو</span>
                    <span className="font-mono text-rose-400 bg-slate-800 px-2 py-1 rounded">اضغط زر التوربو أسفل اليمين</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl">
                    <span className="text-slate-300 font-semibold">معركة الفرق</span>
                    <span className="font-mono text-blue-400 bg-slate-800 px-2 py-1 rounded">الحلفاء يتجاوزون بعضهم بأمان</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 md:px-8 py-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>Snake Crash Arena © 2026</span>
          <span aria-hidden="true">·</span>
          <span>حلبة الثعبان التنافسية</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-emerald-400 text-[11px]">سيرفر اللعب: دبي (18ms)</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>آمن من الاصطدام الذاتي 100%</span>
        </div>
      </footer>
    </div>
  );
};
