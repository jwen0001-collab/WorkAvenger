
import { CharacterProfile, GestureType, Language } from './types';

export const TEXTS = {
  [Language.ZH]: {
    title: "打工不受气！",
    subtitle: "老板画饼？同事甩锅？别憋着。传张照片，AI 把他的脸“贴”到人偶上，咱手底下见真章。",
    startBtn: "立即开练",
    selectTarget: "挑选你的“福报”",
    uploadBtn: "换张讨厌的脸",
    customAdd: "新建受气包",
    generating: "AI 正在贴脸中...",
    totalDmg: "解恨指数",
    rank: "打工段位",
    patience: "忍耐极限",
    combo: "连击",
    back: "算了，回去搬砖",
    retry: "再出一口恶气",
    thinking: "AI 正在看戏",
    active: "监控中",
    select: "就打他了",
    customPrompt: "描述下他（如：地中海、黑框眼镜、一脸傲气）",
    customName: "给他起个外号"
  }
};

export const SOUNDS = {
  PUNCH: '/sounds/punch.mp3',
  SLAP: '/sounds/slap.mp3',
  SCOLD: '/sounds/scold.mp3',
  HIT: '/sounds/hit.mp3',
  VICTORY: '/sounds/victory.mp3',
  FINISH: '/sounds/scold.mp3',
  TEAR: '/sounds/tear.mp3'
};






export const CHARACTERS: CharacterProfile[] = [
  {
    id: 'boss-1',
    name: '挑刺张',
    role: '细节控 / Micromanager',
    description: '盯着错别字不放，还要你讲“大局观”。',
    image: '/assets/body_micromanager.png',
    prompt: 'A 3D Pixar style office manager body, wearing a suit, holding a red pen. The head should be prepared for a face photo overlay.',
    maxHp: 1000,
    gender: 'male'
  },
  {
    id: 'boss-2',
    name: 'PUA李',
    role: '画饼大师 / Dreamer',
    description: '不做坏人但干尽坏事，满嘴“为了你好”。',
    image: '/assets/body_dreamer.png',
    prompt: 'A 3D Pixar style businessman body, hands spread as if talking about a big vision, wearing a fancy blazer.',
    maxHp: 1200,
    gender: 'male'
  },
  {
    id: 'junior-1',
    name: '甩锅王',
    role: '装死专家 / Buck-Passer',
    description: '除了干活啥都会，遇事只会说“不知道”。',
    image: '/assets/body_slacker.png',
    prompt: 'A 3D Pixar style young male employee body, slouched, hiding behind a computer monitor.',
    maxHp: 800,
    gender: 'male'
  },
  {
    id: 'senior-1',
    name: '冷淡刘',
    role: '透明人 / Ghost',
    description: '“不归我管，别找我。” 冷到空气结冰。',
    image: '/assets/body_ghost.png',
    prompt: 'A 3D Pixar style senior female employee body, arms crossed, wearing a gray blazer.',
    maxHp: 900,
    gender: 'female'
  }
];

export const GESTURE_MAP = {
  [GestureType.FIST]: { action: 'PUNCH', damage: 15, label: '👊 暴击', sound: SOUNDS.PUNCH },
  [GestureType.PALM]: { action: 'SLAP', damage: 10, label: '🖐️ 扇脸', sound: SOUNDS.SLAP },
  [GestureType.TEAR]: { action: 'RIP', damage: 25, label: '👐 手撕', sound: SOUNDS.TEAR },
  [GestureType.NONE]: { action: 'IDLE', damage: 0, label: '', sound: '' },
};
