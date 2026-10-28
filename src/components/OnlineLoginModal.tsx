import React, { useState } from 'react';
import { PlayerProfile, SERVERS } from '../types/game';
import { sounds } from '../services/sound';
import { X, ShieldCheck, Globe, Trophy, User, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface OnlineLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: PlayerProfile) => void;
  currentProfile: PlayerProfile;
}

export const OnlineLoginModal: React.FC<OnlineLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentProfile,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState(currentProfile.isGuest ? '' : currentProfile.username);
  const [password, setPassword] = useState('');
  const [selectedServer, setSelectedServer] = useState<string>(currentProfile.serverRegion);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();

    if (!username.trim()) {
      setFeedbackMsg({ text: 'يرجى إدخال اسم اللاعب', success: false });
      return;
    }

    if (password.length < 4) {
      setFeedbackMsg({ text: 'كلمة المرور يجب أن لا تقل عن 4 خانات', success: false });
      return;
    }

    setIsLoading(true);
    setFeedbackMsg(null);

    // Simulate authentic online authentication and profile sync
    setTimeout(() => {
      setIsLoading(false);
      const updatedProfile: PlayerProfile = {
        ...currentProfile,
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        username: username.trim(),
        isGuest: false,
        trophies: Math.max(currentProfile.trophies, 480),
        rankTitle: 'بطل أونلاين صاعد',
        serverRegion: selectedServer as PlayerProfile['serverRegion'],
      };

      // Persist to local storage for recurring sessions
      localStorage.setItem('snake_crash_online_profile', JSON.stringify(updatedProfile));
      sounds.playKill();
      setFeedbackMsg({ text: 'تم تسجيل الدخول بنجاح! متصل بسيرفر الحلبة.', success: true });

      setTimeout(() => {
        onLoginSuccess(updatedProfile);
        onClose();
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/80 border border-cyan-800/50 mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          <h3 className="text-xl font-black text-white tracking-wide">
            {tab === 'login' ? 'تسجيل الدخول إلى حساب الحلبة' : 'إنشاء حساب أونلاين جديد'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            احفظ بطولاتك، نافس أصدقاءك وافتح مظاهر الثعابين النادرة في خوادم اللعب العالمية
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setTab('login');
              setFeedbackMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setTab('register');
              setFeedbackMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* Feedback Banner */}
        {feedbackMsg && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              feedbackMsg.success
                ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/70 border border-rose-800 text-rose-300'
            }`}
          >
            {feedbackMsg.success && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم اللاعب / المعرف</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: البطل_الخارق"
                maxLength={18}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>اختر سيرفر اللعب الإقليمي</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">Ping أقل = استجابة أسرع</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SERVERS.map((server) => (
                <button
                  key={server.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedServer(server.id);
                  }}
                  className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                    selectedServer === server.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold truncate">{server.nameAr}</span>
                  <div className="flex items-center justify-between text-[10px] mt-1 text-slate-400">
                    <span className="font-mono text-emerald-400">{server.ping}ms</span>
                    <span className="text-slate-500">{server.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right text-white font-black text-sm rounded-xl shadow-lg shadow-cyan-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{tab === 'login' ? 'دخول فوري للحساب' : 'إنشاء وتفعيل الحساب'}</span>
              </>
            )}
          </button>
        </form>

        {/* Guest switch option */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            تفضل اللعب السريع دون تسجيل؟ <span className="underline font-bold">العب كزائر مباشرة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
