import React, { useState, useEffect } from 'react';
import { GameMode, PlayerProfile, SkinId, TeamId } from './types/game';
import { Lobby } from './components/Lobby';
import { SnakeCanvas } from './components/SnakeCanvas';
import { GameOverModal } from './components/GameOverModal';
import { OnlineLoginModal } from './components/OnlineLoginModal';

const DEFAULT_PROFILE: PlayerProfile = {
  id: 'guest_' + Math.random().toString(36).substring(2, 7),
  username: 'محارب_الحلبة',
  isGuest: true,
  avatar: 'honey_berry',
  skinId: 'honey_berry',
  trophies: 240,
  highestScore: 1250,
  totalKills: 14,
  totalGames: 8,
  rankTitle: 'مقاتل ناشئ',
  serverRegion: 'me_dubai',
};

export default function App() {
  const [appState, setAppState] = useState<'LOBBY' | 'PLAYING' | 'CRASHED'>('LOBBY');
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem('snake_crash_online_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_PROFILE,
            ...parsed,
            skinId: parsed.skinId || 'honey_berry',
          };
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  const [currentGame, setCurrentGame] = useState<{
    name: string;
    skinId: SkinId;
    mode: GameMode;
    team: TeamId;
  }>({
    name: playerProfile.username,
    skinId: playerProfile.skinId,
    mode: 'crash_arena',
    team: 'blue',
  });

  const [lastResult, setLastResult] = useState<{
    score: number;
    length: number;
    kills: number;
    survivalSeconds: number;
    isNewHigh: boolean;
  }>({
    score: 0,
    length: 0,
    kills: 0,
    survivalSeconds: 0,
    isNewHigh: false,
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync profile changes to localStorage
  const handleUpdateProfile = (newProfile: PlayerProfile) => {
    setPlayerProfile(newProfile);
    try {
      localStorage.setItem('snake_crash_online_profile', JSON.stringify(newProfile));
    } catch {
      // ignore
    }
  };

  // Launch game
  const handleStartGame = (name: string, skinId: SkinId, mode: GameMode, team: TeamId = 'blue') => {
    setCurrentGame({ name, skinId, mode, team });
    setAppState('PLAYING');
  };

  // Handle Game Over
  const handleGameOver = (score: number, length: number, kills: number, survivalSeconds: number) => {
    const isNewHigh = score > playerProfile.highestScore;

    const updatedProfile: PlayerProfile = {
      ...playerProfile,
      highestScore: Math.max(playerProfile.highestScore, score),
      totalKills: playerProfile.totalKills + kills,
      totalGames: playerProfile.totalGames + 1,
      trophies: playerProfile.trophies + Math.floor(score / 50) + kills * 10,
    };

    handleUpdateProfile(updatedProfile);

    setLastResult({
      score,
      length,
      kills,
      survivalSeconds,
      isNewHigh,
    });

    setAppState('CRASHED');
  };

  // Rematch / Play Again
  const handlePlayAgain = () => {
    setAppState('PLAYING');
  };

  // Return to Lobby
  const handleExitToLobby = () => {
    setAppState('LOBBY');
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans">
      {appState === 'LOBBY' && (
        <Lobby
          onStartGame={handleStartGame}
          playerProfile={playerProfile}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {appState === 'PLAYING' && (
        <SnakeCanvas
          playerName={currentGame.name}
          playerSkinId={currentGame.skinId}
          gameMode={currentGame.mode}
          playerTeam={currentGame.team}
          onGameOver={handleGameOver}
          onExitToLobby={handleExitToLobby}
        />
      )}

      {appState === 'CRASHED' && (
        <>
          {/* Keep canvas visible under blur */}
          <SnakeCanvas
            playerName={currentGame.name}
            playerSkinId={currentGame.skinId}
            gameMode={currentGame.mode}
            playerTeam={currentGame.team}
            onGameOver={() => {}}
            onExitToLobby={handleExitToLobby}
          />
          <GameOverModal
            score={lastResult.score}
            length={lastResult.length}
            kills={lastResult.kills}
            survivalSeconds={lastResult.survivalSeconds}
            isNewHigh={lastResult.isNewHigh}
            onPlayAgain={handlePlayAgain}
            onExitToLobby={handleExitToLobby}
          />
        </>
      )}

      {/* Online Authentication & Cloud Profile Modal */}
      <OnlineLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(profile) => {
          handleUpdateProfile(profile);
        }}
        currentProfile={playerProfile}
      />
    </div>
  );
}
