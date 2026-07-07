import type { MissionDef, MissionId } from './types';

// 미션 5개의 기본 정보. 퀴즈 문항은 quizzes.ts, 대사는 dialogues.ts에 있다.
export const MISSIONS: MissionDef[] = [
  {
    id: 'security',
    order: 1,
    roomName: '보안실',
    topic: '개인정보 보호',
    badge: '🔒',
    badgeName: '개인정보 지킴이',
    npcId: 'guard',
    npcName: '강철벽 요원',
    reviewCard: {
      title: '개인정보 보호',
      body: 'AI에게 이름, 전화번호, 주소, 학교·반 같은 개인정보를 보내지 않는다. 대화 내용은 서버에 저장될 수 있다.',
    },
  },
  {
    id: 'prompt',
    order: 2,
    roomName: '프롬프트 랩',
    topic: '프롬프트 작성',
    badge: '✏️',
    badgeName: '프롬프트 장인',
    npcId: 'writer',
    npcName: '한줄기 연구원',
    reviewCard: {
      title: '프롬프트 작성',
      body: '역할·대상·형식을 정해주면 AI의 답이 좋아진다. "글 써줘"보다 "중학생 눈높이로 5줄 요약해줘"가 낫다.',
    },
  },
  {
    id: 'data',
    order: 3,
    roomName: '데이터실',
    topic: '데이터 편향',
    badge: '⚖️',
    badgeName: '편향 감별사',
    npcId: 'doctor',
    npcName: '나균형 박사',
    reviewCard: {
      title: '데이터 편향',
      body: 'AI는 배운 데이터를 닮는다. 한쪽으로 치우친 데이터로 배우면 AI의 판단도 치우친다.',
    },
  },
  {
    id: 'studio',
    order: 4,
    roomName: '생성 AI 스튜디오',
    topic: 'AI 결과 검증',
    badge: '🔍',
    badgeName: '팩트 체커',
    npcId: 'artist',
    npcName: '오팩트 아티스트',
    reviewCard: {
      title: 'AI 결과 검증',
      body: 'AI는 자신 있게 틀린 말을 지어내기도 한다(환각). 중요한 정보는 믿을 수 있는 자료와 교차 확인한다.',
    },
  },
  {
    id: 'ethics',
    order: 5,
    roomName: 'AI 윤리위원회',
    topic: 'AI 윤리',
    badge: '🌱',
    badgeName: '윤리 수호자',
    npcId: 'chief',
    npcName: '정의로 위원장',
    reviewCard: {
      title: 'AI 윤리',
      body: 'AI가 만든 결과물을 쓸 때는 사용 사실을 밝힌다. 다른 사람의 얼굴·작품을 함부로 쓰지 않는다.',
    },
  },
];

export const MISSION_BY_ID: Record<MissionId, MissionDef> = Object.fromEntries(
  MISSIONS.map((m) => [m.id, m]),
) as Record<MissionId, MissionDef>;

export const MISSION_BY_NPC: Record<string, MissionDef> = Object.fromEntries(
  MISSIONS.map((m) => [m.npcId, m]),
);
