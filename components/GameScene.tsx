
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterProfile, GestureType, Language } from '../types';
import { GESTURE_MAP, TEXTS, SOUNDS } from '../constants';
import { detectGestureFromVideo, generateCharacterReaction } from '../services/geminiService';
import CameraPreview from './CameraPreview';

interface GameSceneProps {
  character: CharacterProfile;
  onFinish: (score: number) => void;
  lang: Language;
}

const GameScene: React.FC<GameSceneProps> = ({ character, onFinish, lang }) => {
  const [hp, setHp] = useState(character.maxHp);
  const [combo, setCombo] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [dialogue, setDialogue] = useState<string>("还要对齐下颗粒度？");
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalDamage, setTotalDamage] = useState(0);
  const [activeEffect, setActiveEffect] = useState<'HIT' | 'DODGE' | 'TORN' | 'FLY' | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [papers, setPapers] = useState<{ id: number, x: number, y: number }[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number>();
  const lastVideoTime = useRef<number>(-1);
  const t = TEXTS[lang];

  // 音效播放助手
  // Audio Management
  const playSfx = useCallback((url: string) => {
    if (!url) return;
    try {
      const audio = new Audio(url);
      audio.volume = 0.6; // Slightly lower volume to prevent distorting when overlapping
      audio.play().catch(e => console.warn("Audio play failed (interaction needed?):", e));
    } catch (e) {
      console.error("Audio error:", e);
    }
  }, []);

  const createPapers = useCallback(() => {
    const newPapers = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: 35 + Math.random() * 30,
      y: 45 + Math.random() * 20
    }));
    setPapers(prev => [...prev, ...newPapers]);
    setTimeout(() => {
      setPapers(prev => prev.filter(p => !newPapers.find(np => np.id === p.id)));
    }, 1000);
  }, []);

  const triggerHit = useCallback(async (gesture: GestureType) => {
    if (gesture === GestureType.NONE) return;

    const actionData = GESTURE_MAP[gesture];
    // Randomize damage: 80% to 150% base damage
    const randomFactor = 0.8 + Math.random() * 0.7;
    const dmg = Math.round(actionData.damage * randomFactor);

    // 立即视觉和听觉反馈
    setLastAction(actionData.label);
    setIsShaking(true);
    createPapers();
    if (actionData.sound) playSfx(actionData.sound);

    try {
      // Small optimization: Don't await reaction for the visual hit effect, but do it for dialogue
      const reaction = await generateCharacterReaction(
        character.name,
        character.role,
        gesture,
        Math.round((hp / character.maxHp) * 100),
        lang
      );

      setDialogue(reaction.dialogue);
      setActiveEffect(reaction.effect);

      if (reaction.effect !== 'DODGE') {
        playSfx(SOUNDS.HIT);
        setHp(prev => Math.max(0, prev - dmg));
        setTotalDamage(prev => prev + dmg);
        setCombo(prev => prev + 1);
      } else {
        setCombo(0);
      }

      setTimeout(() => {
        setActiveEffect(null);
        setLastAction(null);
        setIsShaking(false);
      }, 450);
    } catch (err) {
      console.error("AI Error:", err);
    }
  }, [character, hp, lang, createPapers, playSfx]);

  const loop = useCallback(async () => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const video = videoRef.current;

      // Throttle slightly to avoid melting CPU, but keep high fps
      // Actually MediaPipe detectForVideo is optimized for per-frame.
      if (video.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = video.currentTime;

        // This is now purely local and fast (GPU accelerated)
        try {
          // Use a timestamp based on performance.now() which is required by MediaPipe
          const gesture = await detectGestureFromVideo(video, performance.now());

          if (gesture !== GestureType.NONE && !lastAction) {
            // Debounce hits: only if no action currently animating
            await triggerHit(gesture);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [lastAction, triggerHit]); // Depend on lastAction to prevent spamming hits during animation

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  useEffect(() => {
    if (hp <= 0) {
      playSfx(SOUNDS.VICTORY);
      setTimeout(() => onFinish(totalDamage), 1200);
    }
  }, [hp, onFinish, totalDamage, playSfx]);

  return (
    <div className={`relative h-full flex flex-col bg-slate-50 overflow-hidden select-none font-sans transition-all ${isShaking ? 'shake-screen' : ''}`}>
      {/* HUD Header */}
      <div className="relative z-10 p-10 flex justify-between items-end bg-white/70 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="flex-1">
          <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1 uppercase">{character.name}</div>
          <div className="text-orange-600 text-[10px] font-black uppercase mb-4 bg-orange-50 px-3 py-1 rounded-full inline-block border border-orange-200">{character.role}</div>
          <div className="flex items-center gap-6 mt-2">
            <div className="w-80 h-6 bg-slate-200/50 rounded-full overflow-hidden p-1 shadow-inner border border-white">
              <div
                className={`h-full transition-all duration-300 rounded-full ${hp < 30 ? 'bg-red-500 animate-pulse' : 'bg-orange-500 shadow-lg'}`}
                style={{ width: `${(hp / character.maxHp) * 100}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.patience}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-7xl font-black text-orange-500 italic leading-none drop-shadow-2xl">{t.combo} x{combo}</div>
          <div className="text-xs font-black text-slate-300 uppercase mt-3 tracking-widest">{t.totalDmg}: {totalDamage}</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <div className="w-[80vw] h-[80vw] border-[60px] border-slate-900 rounded-full"></div>
        </div>

        {papers.map(p => (
          <div
            key={p.id}
            className="particle-paper"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}

        <div className={`relative transition-all duration-100 ${activeEffect === 'DODGE' ? 'animate-dodge' : ''}`}>
          <div className={`relative ${activeEffect === 'HIT' ? 'impact-hit' : ''}`}>
            <div className="char-shadow"></div>
            <img
              src={character.image}
              alt=""
              className={`h-[65vh] w-[65vh] object-contain drop-shadow-[0_45px_45px_rgba(0,0,0,0.25)] transition-all ${activeEffect === 'TORN' ? 'grayscale brightness-50' : ''}`}
            />
            {activeEffect === 'FLY' && <div className="absolute inset-0 animate-fly"></div>}
          </div>

          <div className="absolute -top-20 -right-28 bg-white text-slate-900 p-8 rounded-[3.5rem] max-w-[320px] shadow-[0_40px_80px_rgba(0,0,0,0.2)] border-[5px] border-slate-900 font-black italic transform rotate-6 scale-110">
            <p className="text-2xl leading-tight">“{dialogue}”</p>
            <div className="absolute -bottom-6 left-12 w-12 h-12 bg-white border-b-[5px] border-r-[5px] border-slate-900 rotate-45"></div>
          </div>

          {lastAction && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
              <span className="text-[20rem] font-black text-red-600 drop-shadow-[0_15px_0px_#000] animate-ping uppercase italic tracking-tighter">
                {lastAction}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 p-8 grid grid-cols-2 gap-12 bg-white border-t border-slate-100 shadow-2xl">
        <div className="flex items-center gap-10">
          <div className="w-56 h-36 bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white relative transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <CameraPreview onVideoRef={(v) => videoRef.current = v} />
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 px-3 py-1.5 rounded-full border border-white/20">
              <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
              <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">
                {isProcessing ? t.thinking : t.active}
              </span>
            </div>
          </div>
          <div className="text-[12px] text-slate-400 font-black leading-snug uppercase tracking-[0.3em] italic">
            🖐️ 扇脸 (PALM)<br />👊 重拳 (FIST)<br />👐 手撕 (TEAR)
          </div>
        </div>

        <div className="flex justify-end items-center gap-6">
          {['👊', '🖐️', '👐'].map(g => (
            <div
              key={g}
              className="w-24 h-24 flex items-center justify-center bg-slate-50 rounded-[3rem] border-2 border-slate-100 text-6xl shadow-sm hover:scale-110 active:scale-90 transition-all select-none"
            >
              {g}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default GameScene;
