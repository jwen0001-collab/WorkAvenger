import { GestureType } from '../types';

export interface Reaction {
  dialogue: string;
  effect: 'HIT' | 'DODGE' | 'TORN' | 'FLY';
}

export const BODY_ASSETS = [
  {
    id: 'body_male_1',
    name: 'Old School Boss',
    image: './assets/body_male_1.png', // We will generate these
    hole: { x: 50, y: 15, w: 20, h: 25 }, // Percentage coordinates for face hole
    gender: 'male'
  },
  {
    id: 'body_female_1',
    name: 'Strict Manager',
    image: './assets/body_female_1.png',
    hole: { x: 50, y: 15, w: 20, h: 25 },
    gender: 'female'
  },
  {
    id: 'body_micromanager',
    name: 'Micromanager',
    image: './assets/body_micromanager.png',
    hole: { x: 50, y: 15, w: 20, h: 25 }, // Approximate hole, might need tuning
    gender: 'male'
  },
  {
    id: 'body_dreamer',
    name: 'Dreamer',
    image: './assets/body_dreamer.png',
    hole: { x: 50, y: 15, w: 20, h: 25 },
    gender: 'male'
  },
  {
    id: 'body_slacker',
    name: 'Slacker',
    image: './assets/body_slacker.png',
    hole: { x: 50, y: 20, w: 20, h: 25 }, // Slouching, maybe lower face
    gender: 'male'
  },
  {
    id: 'body_ghost',
    name: 'Ghost',
    image: './assets/body_ghost.png',
    hole: { x: 50, y: 15, w: 20, h: 25 },
    gender: 'female'
  }
];

export const BOSS_QUOTES: Reaction[] = [
  // Low Damage / Dodge (Defensive/Dismissive)
  { dialogue: "我在开会，晚点说。", effect: "DODGE" },
  { dialogue: "这个需求不紧急。", effect: "DODGE" },
  { dialogue: "你先自己复盘一下。", effect: "DODGE" },
  { dialogue: "收到，已阅。", effect: "DODGE" },

  // Normal Hit (Annoying jargon)
  { dialogue: "格局小了，要有大局观。", effect: "HIT" },
  { dialogue: "我们要对齐一下颗粒度。", effect: "HIT" },
  { dialogue: "你的底层逻辑是什么？", effect: "HIT" },
  { dialogue: "这个方案没有抓手。", effect: "HIT" },
  { dialogue: "形成闭环了吗？", effect: "HIT" },
  { dialogue: "赋能了吗？", effect: "HIT" },
  { dialogue: "痛点在哪里？", effect: "HIT" },

  // Heavy Hit / Critical (Personal/Performance)
  { dialogue: "这就是你的产出？", effect: "TORN" },
  { dialogue: "这种态度怎么干大事？", effect: "TORN" },
  { dialogue: "不接受反驳。", effect: "TORN" },
  { dialogue: "这个月绩效 C。", effect: "TORN" },

  // Finisher / Extreme (Fired/Optimized)
  { dialogue: "公司决定优化你。", effect: "FLY" },
  { dialogue: "去财务结算一下。", effect: "FLY" },
  { dialogue: "毕业快乐！", effect: "FLY" }
];

export const getRandomReaction = (): Reaction => {
  return BOSS_QUOTES[Math.floor(Math.random() * BOSS_QUOTES.length)];
};
