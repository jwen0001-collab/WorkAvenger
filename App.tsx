
import React, { useState, useEffect } from 'react';
import { GameState, CharacterProfile, Language } from './types';
import { CHARACTERS, TEXTS, SOUNDS } from './constants';
import GameScene from './components/GameScene';
import { generateStylizedImage } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [characterList, setCharacterList] = useState<CharacterProfile[]>(CHARACTERS);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [score, setScore] = useState(0);

  const t = TEXTS[Language.ZH];

  const playSfx = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch(() => { });
  };

  useEffect(() => {
    if (gameState === GameState.RESULT) {
      playSfx(SOUNDS.FINISH);
    }
  }, [gameState]);

  const handleFileUpload = async (charId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setIsGenerating(true);

      try {
        const targetChar = characterList.find(c => c.id === charId);
        // Default to male if undefined (shouldn't happen for built-ins, but safe for old custom)
        const gender = targetChar?.gender || 'male';

        const generatedImg = await generateStylizedImage(
          `3D Pixar style office person body, role as: ${targetChar?.prompt}`,
          gender,
          base64
        );

        setCharacterList(prev => prev.map(c =>
          c.id === charId ? { ...c, image: generatedImg } : c
        ));
      } catch (err) {
        alert("贴脸失败，换张正脸照片试试？");
      } finally {
        setIsGenerating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustom = async () => {
    const name = prompt(t.customName);
    if (!name) return;
    const features = prompt(t.customPrompt) || "一脸傲气的同事";
    // Simple prompt for gender
    const genderInput = prompt("性别 (male/female)?")?.toLowerCase();
    const gender: 'male' | 'female' = (genderInput === 'female' || genderInput === '女') ? 'female' : 'male';

    setIsGenerating(true);
    try {
      const generatedImg = await generateStylizedImage(
        `A 3D Pixar style office person with these features: ${features}`,
        gender
      );

      const newChar: CharacterProfile = {
        id: 'custom-' + Date.now(),
        name: name,
        role: '指定受气包',
        description: '别憋着，手底下见真章。',
        image: generatedImg,
        prompt: `A 3D Pixar style person with: ${features}`,
        maxHp: 100,
        isCustom: true,
        gender: gender
      };

      setCharacterList(prev => [...prev, newChar]);
    } catch (err) {
      alert("创建失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#fafafa] text-slate-800 overflow-hidden font-sans">
      {isGenerating && (
        <div className="absolute inset-0 z-[100] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-8 border-orange-100 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">✂️</div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">{t.generating}</p>
        </div>
      )}

      {gameState === GameState.START && (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50">
          <div className="bg-white p-20 rounded-[4.5rem] shadow-2xl border border-gray-100 max-w-2xl transform hover:-rotate-1 transition-all duration-500 relative">
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-5xl shadow-xl border-4 border-white animate-bounce">😤</div>
            <h1 className="text-7xl sm:text-8xl font-black text-slate-900 mb-6 tracking-tighter leading-none whitespace-nowrap">{t.title}</h1>
            <p className="text-slate-500 text-2xl mb-12 leading-relaxed max-w-sm mx-auto font-medium">{t.subtitle}</p>
            <button
              onClick={() => setGameState(GameState.CHARACTER_SELECT)}
              className="px-16 py-7 bg-orange-500 hover:bg-orange-600 text-white rounded-[2.5rem] text-4xl font-black shadow-2xl shadow-orange-200 transition-all hover:scale-105 active:scale-95"
            >
              {t.startBtn}
            </button>
          </div>
        </div>
      )}

      {gameState === GameState.CHARACTER_SELECT && (
        <div className="p-12 h-full flex flex-col items-center overflow-y-auto bg-slate-100/30">
          <h2 className="text-6xl font-black mb-16 text-slate-900 tracking-tighter">{t.selectTarget}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full max-w-7xl pb-16">
            {characterList.map((char) => (
              <div key={char.id} className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-gray-50 group flex flex-col relative transform hover:-translate-y-2 transition-all duration-500">
                <div className="relative h-72 overflow-hidden bg-slate-200">
                  <img src={char.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-5 p-6">
                    <button
                      onClick={() => { setSelectedCharacter(char); setGameState(GameState.PLAYING); }}
                      className="w-full py-4 bg-white text-slate-900 rounded-3xl font-black text-lg shadow-xl"
                    >
                      {t.select}
                    </button>
                    <label className="w-full py-4 bg-orange-500 text-white rounded-3xl font-black text-lg cursor-pointer shadow-xl text-center">
                      {t.uploadBtn}
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(char.id, e)} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-3xl font-black mb-2 text-slate-900">{char.name}</h3>
                  <div className="text-orange-500 text-xs font-black uppercase mb-5 bg-orange-50 px-4 py-1 rounded-full inline-block tracking-widest">{char.role}</div>
                  <p className="text-slate-400 text-base italic font-bold leading-tight">"{char.description}"</p>
                </div>
              </div>
            ))}
            <div onClick={handleAddCustom} className="bg-white/40 border-4 border-dashed border-slate-200 rounded-[3.5rem] flex flex-col items-center justify-center h-full min-h-[450px] cursor-pointer hover:bg-white hover:border-orange-200 transition-all group shadow-sm">
              <span className="text-8xl group-hover:rotate-12 group-hover:scale-125 transition-transform duration-500">➕</span>
              <span className="mt-8 font-black text-slate-400 uppercase tracking-[0.3em] text-sm">{t.customAdd}</span>
            </div>
          </div>
          <button onClick={() => setGameState(GameState.START)} className="mt-8 text-slate-300 hover:text-orange-500 font-black text-sm uppercase tracking-[0.3em] transition-colors duration-300">← {t.back}</button>
        </div>
      )}

      {gameState === GameState.PLAYING && selectedCharacter && (
        <GameScene character={selectedCharacter} onFinish={(s) => { setScore(s); setGameState(GameState.RESULT); }} lang={Language.ZH} />
      )}

      {gameState === GameState.RESULT && (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-slate-50">
          <div className="bg-white p-20 rounded-[5.5rem] shadow-2xl border-[8px] border-slate-900 text-center max-w-2xl relative animate-in zoom-in duration-500">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-5xl text-white shadow-2xl border-4 border-white rotate-12">!</div>
            <h2 className="text-7xl font-black mb-10 italic text-red-600 tracking-tighter uppercase">打 工 报 告</h2>
            <div className="text-xs font-black text-slate-300 mb-2 uppercase tracking-[0.5em]">{t.totalDmg}</div>
            <div className="text-[12rem] font-black mb-16 text-slate-900 leading-none tracking-tighter drop-shadow-lg">{score}</div>
            <div className="px-14 py-6 bg-slate-900 text-white rounded-[3rem] inline-block mb-16 transform -rotate-2 shadow-2xl">
              <span className="text-xs font-black text-slate-400 uppercase mr-4 tracking-[0.2em]">{t.rank}:</span>
              <span className="text-4xl font-black tracking-tighter">{score > 500 ? '打工战神' : '薪水小偷'}</span>
            </div>
            <br />
            <button
              onClick={() => setGameState(GameState.START)}
              className="px-16 py-7 bg-orange-500 text-white rounded-[2.5rem] font-black text-3xl hover:bg-orange-600 transition-all shadow-2xl shadow-orange-100 transform active:scale-90"
            >
              {t.retry}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
