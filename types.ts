
export enum GameState {
  START = 'START',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT'
}

export enum GestureType {
  FIST = 'FIST',
  PALM = 'PALM',
  TEAR = 'TEAR',
  NONE = 'NONE'
}

export enum Language {
  ZH = 'ZH',
  EN = 'EN'
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  gender: 'male' | 'female';
  description: string;
  image: string;
  prompt: string;
  maxHp: number;
  isCustom?: boolean;
  isGenerating?: boolean;
}
