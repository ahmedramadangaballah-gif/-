import React, { useState } from 'react';
import { sounds } from '../services/sound';
import { RotateCcw, Home, Trophy, Skull, Timer, Ruler, Share2, Check } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  length: number;
  kills: number;
  survivalSeconds: number;
  isNewHigh: boolean;
  onPlayAgain: () => void;
  onExitToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  length,
  kills,
  survivalSeconds,
  isNewHigh,
  onPlayAgain,
  onExitToLobby,
}) => {
  const [copied, setCopied] = useState(false);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleShare = () => {
    sounds.playClick();
    const text = `🐍 لقد حققت ${score} نقطة وحطمت ${kills} ثعباناً في لعبة Snake Crash Arena! هل تستطيع هزيمتي؟`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl text-center text-slate-100 overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Crash Title */}
        <div className="relative z-10 mb-5">
          <div className="inline-block px-3 py-1 bg-rose-950/80 border border-rose-800 text-rose-400 text-xs font-black tracking-widest rounded-full uppercase mb-2">
            CRASHED // تحطم الثعبان!
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">انتهت الجولة!</h2>
          {isNewHigh && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold animate-bounce">
              <Trophy className="w-3.5 h-3.5" />
              <span>رقم قياسي شخصي جديد!</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[11px] text-slate-400 font-semibold">النقاط الإجمالية</span>
            <span className="text-xl font-black font-mono text-amber-300 tabular-nums">{score}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <Skull className="w-5 h-5 text-rose-400 mb-1" />
            <span className="text-[11px] text-slate-400 font-semibold">الثعابين المحطمة</span>
            <span className="text-xl font-black font-mono text-rose-300 tabular-nums">{kills}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <Ruler className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-[11px] text-slate-400 font-semibold">أقصى طول وصلته</span>
            <span className="text-xl font-black font-mono text-cyan-300 tabular-nums">{length}</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex flex-col items-center">
            <Timer className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-[11px] text-slate-400 font-semibold">زمن البقاء</span>
            <span className="text-xl font-black font-mono text-emerald-300 tabular-nums">{formatTime(survivalSeconds)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 space-y-3">
          <button
            onClick={() => {
              sounds.playClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-cyan-500 bg-[length:200%_auto] hover:bg-right text-white font-black text-base rounded-2xl shadow-xl shadow-cyan-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>إعادة التحدي فوراً (Play Again)</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onExitToLobby();
              }}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>العودة للردهة</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'مشاركة النتيجة'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
