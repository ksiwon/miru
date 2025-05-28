# 히키코모리 회복 지원 앱

개인 맞춤형 문진과 퀘스트 시스템을 통한 히키코모리 회복 지원 애플리케이션입니다.

## 🎯 주요 기능

### 📋 스마트 문진 시스템
- **체계적인 평가**: 7개 카테고리, 27개 문항으로 구성된 종합적 문진
- **친근한 대화**: 부담 없는 챗봇 인터페이스로 진행
- **실시간 피드백**: 응답에 따른 즉시 격려 및 안내
- **구조화된 데이터**: Firebase에 JSON 형태로 안전하게 저장

### 🎮 맞춤형 퀘스트 시스템
- **변화 단계 분석**: 5단계 변화 모델 기반 개인 상태 분류
- **개인화된 퀘스트**: 문진 결과와 이전 퀘스트 기록을 바탕으로 생성
- **점진적 난이도**: 무관심기 → 유지기까지 단계별 차별화
- **실시간 진행 관리**: 퀘스트 완료 보고 및 새로운 도전 제공

## 🤖 AI 프롬프트 시스템

### 문진 프롬프트
- **역할**: 따뜻하고 친근한 스마트 상담사
- **기능**: 사용자 응답에 대한 맞춤형 격려 및 피드백
- **특징**: 판단하지 않고 공감하며, 사용자 속도에 맞춘 진행

### 퀘스트 프롬프트  
- **역할**: 게임적 요소를 활용한 퀘스트 설계자
- **기능**: 완료 축하, 동기 부여, 맞춤형 추천
- **특징**: 성취 중심의 긍정적 피드백과 구체적 조언

### OpenAI 연동 방식
```typescript
// 문진 중 AI 피드백
const aiFeedback = await OpenAIService.generateAssessmentResponse(
  userResponse, currentQuestion, category, progress
);

// 퀘스트 완료 축하
const congratsMessage = await OpenAIService.generateQuestCompletionMessage(
  questTitle, reward, progressInfo
);
```

## 🛠 기술 스택

### Frontend
- **React 18** + **TypeScript**: 타입 안전성 보장
- **Styled-components**: 컴포넌트 기반 스타일링
- **Pretendard 폰트**: 한국어 최적화 폰트
- **반응형 디자인**: 모바일/데스크톱 호환

### Backend & AI
- **Firebase Firestore**: NoSQL 실시간 데이터베이스
- **OpenAI GPT-4**: 프롬프트 기반 챗봇 시스템
- **Firebase Authentication**: 사용자 인증 (선택사항)
- **보안 규칙**: 개인정보 보호를 위한 접근 제어

### 아키텍처
- **컴포넌트 기반**: 재사용 가능한 모듈식 구조
- **상태 관리**: React Hooks 기반 로컬 상태 관리
- **타입 시스템**: 완전한 TypeScript 지원

## 📁 프로젝트 구조

```
src/
├── pages/                  # 페이지 컴포넌트
│   ├── AssessmentPage.tsx  # 문진 페이지
│   └── QuestPage.tsx       # 퀘스트 페이지
├── styles/                 # 스타일 관련
│   ├── GlobalStyle.ts      # 전역 스타일
│   ├── theme.ts           # 테마 정의
│   ├── styled-components.d.ts
│   └── styled.d.ts        # 타입 정의
├── api/                   # API 레이어
│   └── firebaseAPI.ts     # Firebase 연동
├── services/              # 비즈니스 로직
│   └── questGenerator.ts  # 퀘스트 생성 로직
├── types/                 # TypeScript 타입
│   └── index.ts          # 공통 타입 정의
├── lib/                   # 라이브러리 설정
│   └── firebase.ts       # Firebase 초기화
└── App.tsx               # 메인 앱 컴포넌트
```

## 🚀 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. Firebase 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firestore Database 활성화
3. 프로젝트 설정에서 웹 앱 추가
4. `.env.example`을 참고하여 `.env` 파일 생성

### 3. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에 Firebase 설정 정보 입력
```

### 4. 개발 서버 실행
```bash
npm start
```

### 5. 프로덕션 빌드
```bash
npm run build
```

## 🔒 보안 및 개인정보 보호

- **Firestore 보안 규칙**: 개인 데이터 접근 제한
- **데이터 암호화**: Firebase 자동 암호화
- **최소 권한 원칙**: 필요한 데이터만 수집/저장
- **익명화 옵션**: 민감 정보 익명 처리 가능

## 📊 데이터 구조

### 사용자 데이터 (UserData)
```typescript
{
  name: string;
  age: number;
  gender: string;
  residence: { livingSituation: string; environment: string; };
  hikikomoriStatus: { startDate: string; avgOutTimePerDay: string; ... };
  mentalState: { anxietyLevel: number; socialDiscomfort: string; ... };
  digitalBehavior: { dailyScreenTime: string; platforms: string[]; ... };
  interests: { likes: string[]; goals: string; dislikes: string[]; };
  health: { chronicConditions: string; lifestyle: string; ... };
  pastExperiences: { triedToGoOut: boolean; motivators: string[]; ... };
}
```

### 퀘스트 데이터 (QuestData)
```typescript
{
  userId: string;
  userName: string;
  stage: 'precontemplation' | 'contemplation' | 'preparation' | 'action' | 'maintenance';
  quests: Array<{
    id: string;
    title: string;
    unlock_condition: string;
    completion_condition: string;
    reward: string;
    completed: boolean;
  }>;
  createdAt: Date;
}
```

## 🎯 변화 단계 모델

1. **무관심기**: 변화에 대한 관심 낮음
2. **숙고기**: 변화 필요성 인식 시작
3. **준비기**: 구체적 변화 계획 수립
4. **행동기**: 실제 행동 변화 실행
5. **유지기**: 긍정적 변화 지속

각 단계별로 차별화된 퀘스트와 지원 방식을 제공합니다.

## 🤝 기여 방법

1. 이슈 등록을 통한 버그 리포트 및 기능 제안
2. Pull Request를 통한 코드 기여
3. 사용자 피드백 및 개선 아이디어 제공

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🔗 관련 링크

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [styled-components Documentation](https://styled-components.com)

---

💜 **함께 성장하는 회복 여정을 응원합니다!**