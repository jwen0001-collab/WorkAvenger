
import React from 'react';

const SetupScreen: React.FC = () => {
  return (
    <div className="p-10 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-4">AI 角色调优</h3>
      <p className="text-slate-400 mb-6">描述你的老板或同事，生成自定义的 AI 形象和对话。让复仇更精准！</p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">角色性格描述</label>
          <input 
            type="text" 
            placeholder="例如：阴阳怪气，喜欢用大道理压人"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        
        <div className="flex gap-4">
          <button className="flex-1 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-all">立即生成</button>
          <button className="flex-1 py-3 bg-slate-700 rounded-xl font-bold hover:bg-slate-600 transition-all">跳过</button>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;
