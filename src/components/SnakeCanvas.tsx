import React, { useEffect, useRef, useState } from 'react';
import {
  Snake,
  Pellet,
  CrashParticle,
  KillEvent,
  LeaderboardEntry,
  SKINS_DATA,
  BOT_NAMES_WITH_FLAGS,
  GameMode,
  SkinId,
  FoodType,
  FloatingText,
  TeamId,
} from '../types/game';
import { sounds } from '../services/sound';
import { Volume2, VolumeX, ArrowLeft } from 'lucide-react';

interface SnakeCanvasProps {
  playerName: string;
  playerSkinId: SkinId;
  gameMode: GameMode;
  playerTeam?: TeamId;
  onGameOver: (finalScore: number, finalLength: number, kills: number, survivalSeconds: number) => void;
  onExitToLobby: () => void;
}

const ARENA_RADIUS = 1900;
const INITIAL_SEGMENTS = 30;
const SEGMENT_DISTANCE = 8.5; // Tightly overlapping for silky-smooth 3D tube look
const BASE_SPEED = 8.8;       // Smooth, fast, and agile
const BOOST_SPEED = 15.6;     // Exhilarating boost without clipping

// Safe cross-browser rounded rectangle helper
const drawRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
};

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
  playerName,
  playerSkinId,
  gameMode,
  playerTeam = 'blue',
  onGameOver,
  onExitToLobby,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Audio state
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  // Top HUD stats (Exact match to uploaded images)
  const [elapsedSeconds, setElapsedSeconds] = useState(70);
  const [killsCount, setKillsCount] = useState(0);
  const [playerScore, setPlayerScore] = useState(141);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Controls state refs
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);
  const isTouchBoostingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Virtual Joystick visual state
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickBase, setJoystickBase] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Game World State
  const gameStateRef = useRef<{
    player: Snake | null;
    bots: Snake[];
    pellets: Pellet[];
    particles: CrashParticle[];
    floatingTexts: FloatingText[];
    camera: { x: number; y: number; zoom: number };
    startTime: number;
    isRunning: boolean;
    pelletIdCounter: number;
    lastBoostEatTime: number;
  }>({
    player: null,
    bots: [],
    pellets: [],
    particles: [],
    floatingTexts: [],
    camera: { x: 0, y: 0, zoom: 1 },
    startTime: Date.now(),
    isRunning: true,
    pelletIdCounter: 1,
    lastBoostEatTime: 0,
  });

  const speedMultiplier = gameMode === 'turbo_blitz' ? 1.3 : gameMode === 'crash_arena' ? 1.15 : 1.0;

  // Helper to create a snake matching the exact cartoon slither style
  const createSnake = (
    id: string,
    name: string,
    skinId: SkinId,
    isPlayer: boolean,
    startX: number,
    startY: number,
    startAngle: number,
    team: TeamId = 'none',
    flag: string = '🇸🇦'
  ): Snake => {
    const skin = SKINS_DATA[skinId] || SKINS_DATA.honey_berry;
    const segments = [];
    for (let i = 0; i < INITIAL_SEGMENTS; i++) {
      segments.push({
        x: startX - Math.cos(startAngle) * (i * SEGMENT_DISTANCE),
        y: startY - Math.sin(startAngle) * (i * SEGMENT_DISTANCE),
      });
    }

    return {
      id,
      name,
      isBot: !isPlayer,
      isPlayer,
      skinId,
      team,
      headType: skin.headType,
      primaryColor: skin.primaryColor,
      secondaryColor: skin.secondaryColor,
      stripeColor: skin.stripeColor,
      glowColor: skin.glowColor,
      x: startX,
      y: startY,
      angle: startAngle,
      targetAngle: startAngle,
      speed: BASE_SPEED * speedMultiplier,
      baseSpeed: BASE_SPEED * speedMultiplier,
      isBoosting: false,
      segments,
      targetLength: INITIAL_SEGMENTS,
      radius: 19, // Plump, juicy 3D tube radius
      alive: true,
      score: 140,
      kills: 0,
      boostStamina: 100,
      aiTurnTimer: Math.random() * 30 + 15,
      countryCode: flag,
    };
  };

  // Helper to spawn initial candy treats & food matching the screenshots
  const spawnInitialFood = (count: number) => {
    const pellets: Pellet[] = [];
    const foodTypes: FoodType[] = [
      'donut',
      'wrapped_candy',
      'heart_choco',
      'flower_cookie',
      'jelly_cube',
      'lemon_slice',
      'lollipop',
      'dot',
    ];
    const colors = ['#f43f5e', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#facc15'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * (ARENA_RADIUS - 60);
      const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
      pellets.push({
        id: i,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        radius: foodType === 'dot' ? 5 : Math.random() * 4 + 13,
        color: colors[Math.floor(Math.random() * colors.length)],
        value: foodType === 'dot' ? 2 : Math.floor(Math.random() * 5) + 6,
        foodType,
        rotation: Math.random() * Math.PI * 2,
      });
    }
    return pellets;
  };

  // Spawn food feast from crashed snake (Donuts, Candies, Cupcakes!)
  const spawnCrashFoodFeast = (snake: Snake) => {
    const foodTypes: FoodType[] = ['donut', 'wrapped_candy', 'heart_choco', 'flower_cookie', 'jelly_cube', 'lemon_slice'];
    const colors = ['#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#a855f7'];

    for (let i = 0; i < snake.segments.length; i += 2) {
      const seg = snake.segments[i];
      const count = Math.min(3, Math.max(1, Math.floor(snake.score / 350)));
      for (let j = 0; j < count; j++) {
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetR = Math.random() * (snake.radius * 1.6);
        const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
        gameStateRef.current.pellets.push({
          id: ++gameStateRef.current.pelletIdCounter,
          x: seg.x + Math.cos(offsetAngle) * offsetR,
          y: seg.y + Math.sin(offsetAngle) * offsetR,
          radius: Math.random() * 4 + 14,
          color: colors[Math.floor(Math.random() * colors.length)],
          value: 15,
          foodType,
          rotation: Math.random() * Math.PI * 2,
          isSuper: true,
        });
      }
    }
  };

  // Floating text like "+155 +220" or "Unstoppable!"
  const addFloatingBanner = (x: number, y: number, text: string, subText?: string, color: string = '#facc15') => {
    gameStateRef.current.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      subText,
      color,
      alpha: 1,
      life: 0,
      scale: 1.2,
    });
  };

  // Sound toggle
  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  // Initialize Game World
  useEffect(() => {
    const skinsList: SkinId[] = [
      'honey_berry',
      'rainbow_candy',
      'frost_snowman',
      'ocean_swirl',
      'strawberry_lime',
      'cosmic_violet',
      'golden_imperial',
      'shadow_skull',
    ];

    const player = createSnake('player', playerName || 'متدرب', playerSkinId, true, 0, 0, 0, playerTeam, '🇸🇦');

    const bots: Snake[] = [];
    const botCount = 9;
    for (let i = 0; i < botCount; i++) {
      const angle = (i / botCount) * Math.PI * 2 + Math.random() * 0.35;
      const r = Math.random() * 800 + 400;
      const botProfile = BOT_NAMES_WITH_FLAGS[i % BOT_NAMES_WITH_FLAGS.length];
      const skinId = skinsList[i % skinsList.length];
      const botTeam = gameMode === 'team_battle' ? (i % 2 === 0 ? 'red' : 'blue') : 'none';

      bots.push(
        createSnake(
          `bot_${i}`,
          botProfile.name,
          skinId,
          false,
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          angle + Math.PI,
          botTeam,
          botProfile.flag
        )
      );
    }

    gameStateRef.current.player = player;
    gameStateRef.current.bots = bots;
    gameStateRef.current.pellets = spawnInitialFood(450);
    gameStateRef.current.particles = [];
    gameStateRef.current.floatingTexts = [];
    gameStateRef.current.startTime = Date.now();
    gameStateRef.current.isRunning = true;

    // Window resize
    const updateDimensions = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Desktop controls
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) isMouseDownRef.current = true;
    };
    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;
      if (e.code === 'Space' || e.key === 'Shift') isMouseDownRef.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
      if (e.code === 'Space' || e.key === 'Shift') isMouseDownRef.current = false;
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('contextmenu', handleContextMenu);

    // Game Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      if (gameStateRef.current.isRunning) {
        updateGame(dt);
        renderGame();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [gameMode, playerTeam, playerName, playerSkinId]);

  // Main physics & collision loop
  const updateGame = (dt: number) => {
    const state = gameStateRef.current;
    const player = state.player;
    if (!player) return;

    // Timer update
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    setElapsedSeconds(elapsed);

    // Player Direction Steering
    if (player.alive) {
      let desiredAngle = player.angle;

      if (joystickActive && touchCurrentRef.current && touchStartRef.current) {
        const dx = touchCurrentRef.current.x - touchStartRef.current.x;
        const dy = touchCurrentRef.current.y - touchStartRef.current.y;
        if (Math.hypot(dx, dy) > 8) {
          desiredAngle = Math.atan2(dy, dx);
        }
      } else {
        const keys = keysPressedRef.current;
        let kx = 0;
        let ky = 0;
        if (keys['arrowup'] || keys['w']) ky -= 1;
        if (keys['arrowdown'] || keys['s']) ky += 1;
        if (keys['arrowleft'] || keys['a']) kx -= 1;
        if (keys['arrowright'] || keys['d']) kx += 1;

        if (kx !== 0 || ky !== 0) {
          desiredAngle = Math.atan2(ky, kx);
        } else {
          const m = mousePosRef.current;
          if (m.x !== 0 || m.y !== 0) {
            desiredAngle = Math.atan2(m.y, m.x);
          }
        }
      }

      // Smooth turning interpolation
      let angleDiff = desiredAngle - player.angle;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      player.angle += angleDiff * Math.min(1, 16 * dt);

      // Boosting Logic
      const isBoostingInput = isMouseDownRef.current || isTouchBoostingRef.current;
      if (isBoostingInput && player.boostStamina > 8 && player.segments.length > 15) {
        player.isBoosting = true;
        player.speed = BOOST_SPEED * speedMultiplier;
        player.boostStamina = Math.max(0, player.boostStamina - 24 * dt);

        if (Date.now() - state.lastBoostEatTime > 200) {
          state.lastBoostEatTime = Date.now();
          sounds.playBoostPulse();
          const tail = player.segments[player.segments.length - 1];
          state.pellets.push({
            id: ++state.pelletIdCounter,
            x: tail.x + (Math.random() - 0.5) * 8,
            y: tail.y + (Math.random() - 0.5) * 8,
            radius: 5,
            color: player.stripeColor,
            value: 2,
            foodType: 'dot',
          });
          if (player.targetLength > 16) {
            player.targetLength -= 0.15;
          }
        }
      } else {
        player.isBoosting = false;
        player.speed = player.baseSpeed;
        player.boostStamina = Math.min(100, player.boostStamina + 18 * dt);
      }
    }

    const allSnakes = [player, ...state.bots];

    for (const snake of allSnakes) {
      if (!snake.alive) continue;

      if (snake.isBot) {
        updateBotAI(snake, allSnakes, state.pellets, dt);
      }

      // Move Head
      snake.x += Math.cos(snake.angle) * snake.speed;
      snake.y += Math.sin(snake.angle) * snake.speed;

      snake.segments.unshift({ x: snake.x, y: snake.y });

      const desiredCount = Math.floor(snake.targetLength);
      while (snake.segments.length > desiredCount) {
        snake.segments.pop();
      }

      // Maintain segment distance for 3D continuous tube
      for (let i = 1; i < snake.segments.length; i++) {
        const prev = snake.segments[i - 1];
        const curr = snake.segments[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const dist = Math.hypot(dx, dy);
        if (dist > SEGMENT_DISTANCE) {
          const ratio = SEGMENT_DISTANCE / dist;
          curr.x = prev.x + dx * ratio;
          curr.y = prev.y + dy * ratio;
        }
      }

      // Arena boundary collision
      const distFromCenter = Math.hypot(snake.x, snake.y);
      if (distFromCenter > ARENA_RADIUS - snake.radius) {
        if (snake.isPlayer) {
          handleSnakeCrash(snake, null);
        } else {
          const inwardAngle = Math.atan2(-snake.y, -snake.x);
          snake.targetAngle = inwardAngle;
          snake.angle = inwardAngle;
        }
      }

      // Eat Food & Treats
      for (let i = state.pellets.length - 1; i >= 0; i--) {
        const p = state.pellets[i];
        const dist = Math.hypot(snake.x - p.x, snake.y - p.y);
        const eatRange = snake.radius + p.radius + (snake.isBoosting ? 8 : 4);

        if (dist < eatRange) {
          snake.score += p.value * 8;
          snake.targetLength += p.isSuper ? 1.5 : 0.38;
          state.pellets.splice(i, 1);

          if (snake.isPlayer) {
            if (p.isSuper) {
              sounds.playSuperEat();
            } else {
              sounds.playEat();
            }
          }
        }
      }
    }

    // Replenish regular candy if eaten
    if (state.pellets.length < 350) {
      const foodTypes: FoodType[] = ['donut', 'wrapped_candy', 'heart_choco', 'flower_cookie', 'jelly_cube', 'lemon_slice'];
      const colors = ['#f43f5e', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * (ARENA_RADIUS - 80);
      const foodType = foodTypes[Math.floor(Math.random() * foodTypes.length)];
      state.pellets.push({
        id: ++state.pelletIdCounter,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        radius: Math.random() * 4 + 13,
        color: colors[Math.floor(Math.random() * colors.length)],
        value: 8,
        foodType,
        rotation: Math.random() * Math.PI * 2,
      });
    }

    // ==========================================
    // CRASH DETECTION:
    // 1. NEVER DIE FROM SELF COLLISION!
    // 2. NEVER DIE FROM TEAMMATES!
    // ==========================================
    for (const snakeA of allSnakes) {
      if (!snakeA.alive) continue;

      for (const snakeB of allSnakes) {
        if (!snakeB.alive) continue;
        if (snakeA.id === snakeB.id) continue;
        if (gameMode === 'team_battle' && snakeA.team !== 'none' && snakeA.team === snakeB.team) continue;

        for (let s = 1; s < snakeB.segments.length; s += 2) {
          const seg = snakeB.segments[s];
          const dist = Math.hypot(snakeA.x - seg.x, snakeA.y - seg.y);
          const crashThreshold = snakeA.radius + snakeB.radius * 0.72;

          if (dist < crashThreshold) {
            handleSnakeCrash(snakeA, snakeB);
            break;
          }
        }
      }
    }

    // Update Floating Texts
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y -= 1.2;
      ft.life += 1;
      ft.alpha = Math.max(0, 1 - ft.life / 60);
      if (ft.life >= 60) {
        state.floatingTexts.splice(i, 1);
      }
    }

    // Camera follow player smoothly
    if (player.alive) {
      state.camera.x += (player.x - state.camera.x) * 0.12;
      state.camera.y += (player.y - state.camera.y) * 0.12;
      const targetZoom = Math.max(0.68, 1.0 - (player.segments.length / 550) * 0.28);
      state.camera.zoom += (targetZoom - state.camera.zoom) * 0.05;

      setPlayerScore(Math.floor(player.score));
      setKillsCount(player.kills);

      const sorted = [...allSnakes]
        .filter((s) => s.alive)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((s, index) => ({
          rank: index + 1,
          name: s.name,
          score: Math.floor(s.score),
          kills: s.kills,
          isPlayer: s.isPlayer,
          color: s.primaryColor,
          team: s.team,
          flag: s.countryCode || '🌍',
        }));
      setLeaderboard(sorted);
    }
  };

  // Bot AI
  const updateBotAI = (bot: Snake, allSnakes: Snake[], pellets: Pellet[], dt: number) => {
    bot.aiTurnTimer = (bot.aiTurnTimer || 20) - 1;

    const distFromCenter = Math.hypot(bot.x, bot.y);
    if (distFromCenter > ARENA_RADIUS - 220) {
      const angleToCenter = Math.atan2(-bot.y, -bot.x);
      bot.targetAngle = angleToCenter;
      bot.angle = angleToCenter;
      return;
    }

    let emergencyTurn = false;
    const lookAheadDist = bot.speed * 18;
    const lookAheadX = bot.x + Math.cos(bot.angle) * lookAheadDist;
    const lookAheadY = bot.y + Math.sin(bot.angle) * lookAheadDist;

    for (const other of allSnakes) {
      if (!other.alive || other.id === bot.id) continue;
      if (gameMode === 'team_battle' && bot.team !== 'none' && bot.team === other.team) continue;

      for (let i = 0; i < other.segments.length; i += 3) {
        const seg = other.segments[i];
        if (Math.hypot(lookAheadX - seg.x, lookAheadY - seg.y) < other.radius * 2 + 15) {
          bot.targetAngle += Math.PI * 0.6;
          emergencyTurn = true;
          break;
        }
      }
      if (emergencyTurn) break;
    }

    if (!emergencyTurn && bot.aiTurnTimer <= 0) {
      bot.aiTurnTimer = Math.floor(Math.random() * 35) + 20;

      let closestPellet: Pellet | null = null;
      let minDistance = 350;

      for (let i = 0; i < Math.min(60, pellets.length); i++) {
        const p = pellets[i];
        const dist = Math.hypot(bot.x - p.x, bot.y - p.y);
        if (dist < minDistance) {
          minDistance = dist;
          closestPellet = p;
        }
      }

      if (closestPellet) {
        bot.targetAngle = Math.atan2(closestPellet.y - bot.y, closestPellet.x - bot.x);
      } else {
        bot.targetAngle += (Math.random() - 0.5) * 1.2;
      }

      if (bot.boostStamina > 40 && Math.random() < 0.25) {
        bot.isBoosting = true;
        bot.speed = BOOST_SPEED * speedMultiplier;
      } else {
        bot.isBoosting = false;
        bot.speed = bot.baseSpeed;
      }
    }

    let diff = bot.targetAngle - bot.angle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    bot.angle += diff * Math.min(1, 14 * dt);
  };

  // Handle Crash
  const handleSnakeCrash = (victim: Snake, killer: Snake | null) => {
    if (!victim.alive) return;
    victim.alive = false;

    spawnCrashFoodFeast(victim);

    if (killer && killer.alive) {
      killer.kills += 1;
      const killBonus = Math.floor(victim.score * 0.4) + 180;
      killer.score += killBonus;

      if (killer.isPlayer) {
        sounds.playKill();
        addFloatingBanner(victim.x, victim.y, `${killer.kills}. Kill`, `+${killBonus}`, '#f59e0b');
      }
    }

    if (victim.isPlayer) {
      sounds.playCrash();
      const survivalTime = Math.floor((Date.now() - gameStateRef.current.startTime) / 1000);
      setTimeout(() => {
        onGameOver(Math.floor(victim.score), victim.segments.length, victim.kills, survivalTime);
      }, 700);
    } else {
      setTimeout(() => {
        if (!gameStateRef.current.isRunning) return;
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 800 + 350;
        const skinsList: SkinId[] = ['honey_berry', 'rainbow_candy', 'frost_snowman', 'ocean_swirl'];
        const newBot = createSnake(
          victim.id,
          victim.name,
          skinsList[Math.floor(Math.random() * skinsList.length)],
          false,
          Math.cos(angle) * r,
          Math.sin(angle) * r,
          angle + Math.PI,
          victim.team,
          victim.countryCode
        );
        const botIndex = gameStateRef.current.bots.findIndex((b) => b.id === victim.id);
        if (botIndex !== -1) {
          gameStateRef.current.bots[botIndex] = newBot;
        }
      }, 3500);
    }
  };

  // Draw Candies & Treats (Signature Visuals from the uploaded screenshots)
  const drawFoodItem = (ctx: CanvasRenderingContext2D, p: Pellet) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.rotation) ctx.rotate(p.rotation);

    const r = p.radius;

    switch (p.foodType) {
      case 'donut': {
        // Frosted Donut with Sprinkles & Center Hole (as seen in screenshots)
        // Dough
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        // Icing Frosting (Green or Pink)
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Donut hole
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#14182b';
        ctx.fill();

        // Sprinkles
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-r * 0.45, -r * 0.45, 3, 2);
        ctx.fillRect(r * 0.25, -r * 0.5, 2, 3);
        ctx.fillRect(-r * 0.3, r * 0.4, 3, 2);
        ctx.fillRect(r * 0.35, r * 0.35, 2, 3);
        break;
      }

      case 'wrapped_candy': {
        // Wrapped Bonbon with Twists (as in screenshots)
        ctx.fillStyle = p.color;
        // Left & Right wrapper twists
        ctx.beginPath();
        ctx.moveTo(-r * 0.6, 0);
        ctx.lineTo(-r * 1.3, -r * 0.6);
        ctx.lineTo(-r * 1.3, r * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(r * 0.6, 0);
        ctx.lineTo(r * 1.3, -r * 0.6);
        ctx.lineTo(r * 1.3, r * 0.6);
        ctx.closePath();
        ctx.fill();

        // Center sweet
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.8, r * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();

        // White diagonal wrapper stripes
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-r * 0.3, -r * 0.4);
        ctx.lineTo(r * 0.3, r * 0.4);
        ctx.stroke();
        break;
      }

      case 'heart_choco': {
        // Heart-shaped Chocolate Treat
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.moveTo(0, r * 0.7);
        ctx.bezierCurveTo(-r * 0.9, 0, -r * 0.9, -r * 0.8, 0, -r * 0.4);
        ctx.bezierCurveTo(r * 0.9, -r * 0.8, r * 0.9, 0, 0, r * 0.7);
        ctx.fill();

        // Glossy shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(-r * 0.35, -r * 0.35, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'flower_cookie': {
        // 5-Petal Flower Candy (as seen in screenshot 1 & 3)
        ctx.fillStyle = p.color;
        for (let i = 0; i < 5; i++) {
          const petalAngle = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(Math.cos(petalAngle) * (r * 0.5), Math.sin(petalAngle) * (r * 0.5), r * 0.42, 0, Math.PI * 2);
          ctx.fill();
        }
        // Center core
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();
        break;
      }

      case 'jelly_cube': {
        // Translucent Gummy Square
        ctx.fillStyle = p.color;
        ctx.beginPath();
        drawRoundRect(ctx, -r * 0.7, -r * 0.7, r * 1.4, r * 1.4, 5);
        ctx.fill();
        // Inner jelly reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.2, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'lemon_slice': {
        // Citrus Slice
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();

        // White wedge dividers
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82);
          ctx.stroke();
        }
        break;
      }

      default: {
        // Small glowing sugar pellet / star
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  };

  // Render Game Frame on Canvas
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    const cam = state.camera;
    const width = canvas.width || window.innerWidth;
    const height = canvas.height || window.innerHeight;
    if (!width || !height || width <= 0 || height <= 0) return;

    // Clear background
    ctx.fillStyle = '#111524';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    const zoom = Math.max(0.2, cam.zoom || 1);
    ctx.scale(zoom, zoom);
    ctx.translate(-cam.x, -cam.y);

    // 1. Dark Rounded-Square Floor Grid (EXACT match to uploaded screenshots!)
    const tileSize = 72;
    const gap = 8;
    const step = tileSize + gap;

    const viewW = width / zoom;
    const viewH = height / zoom;
    const minX = Math.max(-ARENA_RADIUS - 100, Math.floor((cam.x - viewW * 0.6) / step) * step);
    const maxX = Math.min(ARENA_RADIUS + 100, Math.ceil((cam.x + viewW * 0.6) / step) * step);
    const minY = Math.max(-ARENA_RADIUS - 100, Math.floor((cam.y - viewH * 0.6) / step) * step);
    const maxY = Math.min(ARENA_RADIUS + 100, Math.ceil((cam.y + viewH * 0.6) / step) * step);

    ctx.fillStyle = '#181d30';
    for (let x = minX; x <= maxX; x += step) {
      for (let y = minY; y <= maxY; y += step) {
        ctx.beginPath();
        drawRoundRect(ctx, x, y, tileSize, tileSize, 12);
        ctx.fill();
      }
    }

    // 2. Arena Boundary Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, ARENA_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 14;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 25;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 3. Draw Candies, Donuts & Food Treats
    for (const p of state.pellets) {
      drawFoodItem(ctx, p);
    }

    // 4. Draw Snakes (Continuous Volumetric 3D Shaded Ribbon with Stripes & Expressive Eyes)
    const allSnakes = [state.player, ...state.bots].filter(Boolean) as Snake[];

    for (const snake of allSnakes) {
      if (!snake.alive || snake.segments.length === 0) continue;

      ctx.save();

      // Draw segments from tail to head
      for (let i = snake.segments.length - 1; i >= 0; i--) {
        const seg = snake.segments[i];
        const progress = i / snake.segments.length;
        const segRadius = snake.radius * (1 - progress * 0.28);

        ctx.save();
        ctx.translate(seg.x, seg.y);

        // Rainbow stripe mode or alternating stripes
        let segColor = snake.primaryColor;
        if (snake.skinId === 'rainbow_candy') {
          const hue = (i * 12) % 360;
          segColor = `hsl(${hue}, 95%, 58%)`;
        } else if (i % 4 < 2) {
          segColor = snake.primaryColor;
        } else {
          segColor = snake.secondaryColor;
        }

        // Draw 3D shaded segment circle
        ctx.beginPath();
        ctx.arc(0, 0, segRadius, 0, Math.PI * 2);
        ctx.fillStyle = segColor;
        if (snake.isBoosting) {
          ctx.shadowColor = snake.glowColor;
          ctx.shadowBlur = 14;
        }
        ctx.fill();

        // 3D Top-Edge Highlight (gives volumetric cylinder look as in images)
        ctx.beginPath();
        ctx.arc(0, -segRadius * 0.25, segRadius * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fill();

        // Center spine ring
        if (i % 2 === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, segRadius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
        }

        ctx.restore();
      }

      // Draw Head
      const head = snake.segments[0];
      const r = snake.radius;

      ctx.save();
      ctx.translate(head.x, head.y);
      ctx.rotate(snake.angle);

      // Main Head Body Circle
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = snake.primaryColor;
      if (snake.isBoosting) {
        ctx.shadowColor = snake.glowColor;
        ctx.shadowBlur = 18;
      }
      ctx.fill();

      // Head 3D Highlight
      ctx.beginPath();
      ctx.arc(0, -r * 0.2, r * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      // HEAD ACCESSORIES & EYES (Exact Match to Images 1, 2, 3)
      if (snake.headType === 'snowman_hat') {
        // Snowman Bucket Hat (as in screenshot 2)
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, 0, r * 0.6, r * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hat rim
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-r * 0.7, -r * 0.9, r * 0.35, r * 1.8);

        // Carrot nose
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(r * 0.8, -3);
        ctx.lineTo(r * 1.5, 0);
        ctx.lineTo(r * 0.8, 3);
        ctx.fill();
      }

      // BIG CARTOON EYES (Exact Match to Screenshots!)
      const eyeOffsetX = r * 0.35;
      const eyeOffsetY = r * 0.55;
      const eyeRadius = r * 0.44;

      // Eye Whites
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(eyeOffsetX, -eyeOffsetY, eyeRadius, 0, Math.PI * 2);
      ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pupils looking in heading direction
      const pupilShiftX = r * 0.14;
      const pupilRadius = eyeRadius * 0.55;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeOffsetX + pupilShiftX, -eyeOffsetY, pupilRadius, 0, Math.PI * 2);
      ctx.arc(eyeOffsetX + pupilShiftX, eyeOffsetY, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Glossy Eye Sparkle Reflection Dots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeOffsetX + pupilShiftX + 2, -eyeOffsetY - 2.5, pupilRadius * 0.4, 0, Math.PI * 2);
      ctx.arc(eyeOffsetX + pupilShiftX + 2, eyeOffsetY - 2.5, pupilRadius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Blushing Pink Cheeks
      ctx.fillStyle = 'rgba(244, 63, 94, 0.5)';
      ctx.beginPath();
      ctx.ellipse(r * 0.3, -r * 0.95, r * 0.25, r * 0.16, 0, 0, Math.PI * 2);
      ctx.ellipse(r * 0.3, r * 0.95, r * 0.25, r * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Player Name Tag & Score
      ctx.save();
      ctx.font = 'bold 13px "Cairo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = snake.isPlayer ? '#38bdf8' : '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(`${snake.countryCode || ''} ${snake.name}`, head.x, head.y - r - 14);
      ctx.restore();

      ctx.restore();
    }

    // 5. Draw Floating Hit Banners (e.g. 8. Kill +155 +220 as seen in screenshots)
    for (const ft of state.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.textAlign = 'center';
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;

      ctx.font = 'black 22px "Outfit", "Cairo", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);

      if (ft.subText) {
        ctx.font = 'bold 15px "JetBrains Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(ft.subText, ft.x, ft.y + 18);
      }
      ctx.restore();
    }

    ctx.restore();
  };

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    if (touchX < rect.width * 0.6) {
      setJoystickActive(true);
      setJoystickBase({ x: touchX, y: touchY });
      setJoystickKnob({ x: touchX, y: touchY });
      touchStartRef.current = { x: touchX, y: touchY };
      touchCurrentRef.current = { x: touchX, y: touchY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickActive || !touchStartRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      if (touchX < rect.width * 0.7) {
        touchCurrentRef.current = { x: touchX, y: touchY };
        const dx = touchX - touchStartRef.current.x;
        const dy = touchY - touchStartRef.current.y;
        const dist = Math.hypot(dx, dy);
        const maxRadius = 45;

        if (dist > maxRadius) {
          setJoystickKnob({
            x: touchStartRef.current.x + (dx / dist) * maxRadius,
            y: touchStartRef.current.y + (dy / dist) * maxRadius,
          });
        } else {
          setJoystickKnob({ x: touchX, y: touchY });
        }
        break;
      }
    }
  };

  const handleTouchEnd = () => {
    setJoystickActive(false);
    touchStartRef.current = null;
    touchCurrentRef.current = null;
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-slate-950 select-none touch-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* TOP HEADER: EXACT MATCH TO SCREENSHOTS */}
      {/* 1. Top Left: Radar Minimap & Exit */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => {
            sounds.playClick();
            onExitToLobby();
          }}
          className="px-2.5 py-1 bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>تجاوز</span>
        </button>

        <button
          onClick={handleToggleSound}
          aria-label="Toggle Sound"
          className="p-1.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Radar Minimap Circle (Top Left, exactly as in image 1 & 2) */}
      <div className="absolute top-12 left-4 w-24 h-24 bg-slate-950/80 border border-slate-700/60 rounded-full shadow-2xl pointer-events-none z-10 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full rounded-full border border-dashed border-slate-700 flex items-center justify-center">
          <div className="w-1 h-1 bg-slate-600 rounded-full" />
          {gameStateRef.current.bots.map((b) => {
            if (!b.alive) return null;
            return (
              <div
                key={b.id}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: b.primaryColor,
                  transform: `translate(${b.x * 0.024}px, ${b.y * 0.024}px)`,
                }}
              />
            );
          })}
          {gameStateRef.current.player && gameStateRef.current.player.alive && (
            <div
              className="absolute w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_6px_#fde047] animate-pulse"
              style={{
                transform: `translate(${gameStateRef.current.player.x * 0.024}px, ${gameStateRef.current.player.y * 0.024}px)`,
              }}
            />
          )}
        </div>
      </div>

      {/* 2. Top Center: Authentic Timer & Kill Count (Matching Screenshots) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 pointer-events-none">
        <div className="text-rose-500 font-mono font-black text-xl md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {formatTimer(elapsedSeconds)}
        </div>
        <div className="text-white font-black text-base md:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-1">
          <span>القتل</span>
          <span className="font-mono text-amber-400">{killsCount}</span>
        </div>
      </div>

      {/* 3. Top Right: Authentic Room Leaderboard (Exact match with flags & stars) */}
      <div className="absolute top-3 right-3 w-56 md:w-64 bg-slate-950/85 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2.5 shadow-2xl pointer-events-none z-20 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5 text-slate-300">
          <span className="font-bold text-[11px]">My Record</span>
          <div className="flex items-center gap-0.5 text-amber-400 text-xs">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>
        </div>

        <div className="space-y-1">
          {leaderboard.map((item) => (
            <div
              key={item.rank}
              className={`flex items-center justify-between py-0.5 px-1.5 rounded transition-colors ${
                item.isPlayer ? 'bg-blue-900/60 font-bold text-cyan-300 ring-1 ring-cyan-400/50' : 'text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                <span
                  className={`text-[10px] font-mono font-black px-1 rounded ${
                    item.rank === 1
                      ? 'bg-amber-500 text-slate-950'
                      : item.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : item.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {item.rank}
                </span>
                <span className="text-[11px]">{item.flag}</span>
                <span className="truncate text-xs">{item.name}</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-xs tabular-nums">{item.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE VIRTUAL JOYSTICK */}
      {joystickActive && (
        <div
          className="absolute rounded-full border-2 border-cyan-400/40 bg-cyan-950/30 pointer-events-none z-30"
          style={{
            width: 90,
            height: 90,
            left: joystickBase.x - 45,
            top: joystickBase.y - 45,
          }}
        >
          <div
            className="absolute rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff]"
            style={{
              width: 38,
              height: 38,
              left: joystickKnob.x - joystickBase.x + 45 - 19,
              top: joystickKnob.y - joystickBase.y + 45 - 19,
            }}
          />
        </div>
      )}

      {/* BOTTOM-RIGHT: SIGNATURE LIGHTNING BOLT TURBO BUTTON (EXACT MATCH TO ALL 3 IMAGES!) */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col items-center">
        <button
          onTouchStart={(e) => {
            e.stopPropagation();
            isTouchBoostingRef.current = true;
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            isTouchBoostingRef.current = false;
          }}
          onMouseDown={() => {
            isMouseDownRef.current = true;
          }}
          onMouseUp={() => {
            isMouseDownRef.current = false;
          }}
          className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#0a1b38] border-4 border-[#38bdf8] shadow-[0_0_28px_rgba(56,189,248,0.7)] flex items-center justify-center active:scale-95 transition-transform touch-manipulation cursor-pointer"
          aria-label="Turbo Boost"
        >
          {/* Inner Glowing Ring */}
          <div className="absolute inset-1.5 rounded-full border-2 border-cyan-300/40" />

          {/* Golden Yellow / Electric Lightning Bolt ⚡ */}
          <div className="relative flex items-center justify-center text-amber-300 filter drop-shadow-[0_0_12px_#facc15]">
            <svg
              className="w-10 h-10 md:w-12 md:h-12 fill-amber-300 stroke-amber-400 stroke-1"
              viewBox="0 0 24 24"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};
