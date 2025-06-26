export interface TarotCard {
  filename: string;
  name: string;
  arcana: "Major" | "Minor";
  suit?: "Cups" | "Swords" | "Wands" | "Pentacles";
  keywords_upright: string[];
  keywords_reversed: string[];
  description: string;
}

export const coreConcernCategories = [
  "Career",       // "진로": 진로, 직장, 이직, 학업 포함
  "Finance",       // "재정": 돈, 투자, 소비, 손실 포함
  "Romance",       // "연애": 썸, 고백, 이별, 재회 포함
  "Relationship",       // "관계": 가족, 친구, 인간관계, 신뢰 포함
  "Emotion",       // "감정": 자존감, 우울, 감정 기복 포함
  "Change",       // "변화": 인생 전환점, 자기 변화, 성장
  "Fortune",       // "운세": 오늘의 운, 흐름, 주의사항 포함
]
