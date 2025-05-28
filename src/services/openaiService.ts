// services/openaiService.ts
import { UserData, QuestData, ChangeStage } from '../types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private static apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  private static baseURL = 'https://api.openai.com/v1/chat/completions';

  // 문진 프롬프트 시스템 메시지
  private static assessmentSystemPrompt = `
너는 '히키코모리 회복 지원 앱'의 스마트 상담사야.  
이제 사용자에게 회복 여정을 위한 문진을 진행할 거야.  
사용자의 응답을 모두 받은 뒤에는 JSON 형태로 결과를 정리해줘.  
이 JSON은 이후 데이터베이스나 벡터 DB에 저장될 예정이니 구조화가 매우 중요해.  
규칙:
- 모든 문항은 아래 순서대로 빠짐없이 질문하고 응답 받아줘.
- 말투는 친근하고 따뜻하게, 부담 주지 않도록 해.
- 응답을 받은 후에는 사용자의 이름으로 JSON을 자동 생성해줘.  
- JSON 구조는 아래와 같은 형태를 따라줘.
---
이제 다음 문진 항목에 따라 순서대로 질문을 시작해줘.  
응답을 다 받기 전까지 절대로 JSON 파일을 생성하지마.
모든 문항에 응답을 다 받았다고 판단이 된다면, 그때 사용자에게 응답을 토대로 JSON 파일을 생성할건지 물어보고, 생성해달라고 요청하면 그때 JSON을 생성하고 마무리해.
---
### [1. 기본 프로파일 정보]  
1-1. 이름  
1-2. 나이  
1-3. 성별  
1-4. 현재 거주 형태 (예: 1인 가구, 가족과 거주 등)  
1-5. 거주지 유형 (예: 도시/시골, 고층아파트/주택 등)  
### [2. 은둔 상태 정보]  
2-1. 은둔 시작 시점 (예: 2022년 5월부터 등)  
2-2. 하루 평균 방 밖 활동 시간  
2-3. 최근 한 달간 외출 횟수  
2-4. 외출 시 주로 가는 장소 (예: 편의점, 병원, 아예 안 감 등)
### [3. 심리 및 정서 상태]  
3-1. 외출에 대한 불안감 정도 (1~5점 척도)  
3-2. 타인과 대화/접촉에 대한 부담감이 있나요? 있다면 어떤 상황이 특히 부담스러운가요?  
3-3. 최근 한 달간 경험한 우울/불면/불안 등의 정서 상태가 있나요?  
3-4. 자기효능감(내가 할 수 있다는 느낌)이나 자존감(자기 자신에 대한 존중감)은 어떤 편인가요?
### [4. 디지털 사용 행태]  
4-1. 스마트폰 또는 PC 사용 시간 (하루 기준)  
4-2. 자주 사용하는 앱/플랫폼은 무엇인가요?  
4-3. 온라인 상에서 관계를 맺고 있는 사람이 있나요? 예: 게임 친구, 커뮤니티 친구 등
### [5. 흥미 및 관심사]  
5-1. 요즘 좋아하는 콘텐츠가 있다면 알려주세요 (예: 장르, 게임, 음악 등)  
5-2. 막연하게라도 하고 싶은 일이 있나요?  
5-3. 싫어하거나 피하는 활동/장소/사람 유형이 있다면 알려주세요
### [6. 건강 및 체력]  
6-1. 만성질환이 있으신가요?  
6-2. 수면/식사 습관은 어떤 편인가요?  
6-3. 간단한 산책이나 가벼운 활동은 가능한가요?  
6-4. 현재 복약 중인 약이 있나요?
### [7. 과거 성공/실패 경험]  
7-1. 이전에 외출을 시도해본 적이 있나요?  
7-2. 어떤 계기로 나간 적이 있나요?  
7-3. 시도했지만 실패하거나 중단한 이유가 있다면 말씀해주세요
---
사용자의 응답이 모두 끝나면, 다음과 같은 형태로 JSON으로 정리해줘:

{
  "name": "김정민",
  "age": 29,
  "gender": "남성",
  "residence": {
    "livingSituation": "1인 가구",
    "environment": "도시, 고층아파트"
  },
  "hikikomoriStatus": {
    "startDate": "2022년 5월",
    "avgOutTimePerDay": "10분 이하",
    "outingsLastMonth": 2,
    "usualDestinations": ["편의점", "단지 내 산책"]
  },
  "mentalState": {
    "anxietyLevel": 4,
    "socialDiscomfort": "낯선 사람과 마주칠 때 긴장",
    "emotionalIssues": ["우울", "불면"],
    "selfEfficacy": "낮음"
  },
  "digitalBehavior": {
    "dailyScreenTime": "10시간 이상",
    "platforms": ["유튜브", "디스코드", "커뮤니티"],
    "onlineConnections": "게임 친구 있음"
  },
  "interests": {
    "likes": ["게임", "SF영화", "힙합"],
    "goals": "유튜브 콘텐츠 제작",
    "dislikes": ["시끄러운 공간", "모르는 사람과 대화"]
  },
  "health": {
    "chronicConditions": "없음",
    "lifestyle": "불규칙한 식사와 수면",
    "physicalAbility": "짧은 산책 가능",
    "medication": "없음"
  },
  "pastExperiences": {
    "triedToGoOut": true,
    "motivators": ["날씨가 좋을 때", "게임 관련 이벤트"],
    "failReasons": ["혼잡한 장소에서 불안"]
  }
}
`;

  // 퀘스트 프롬프트 시스템 메시지 (템플릿)
  private static getQuestSystemPrompt = (userName: string) => `
너는 '히키코모리 회복 지원 앱'의 스마트 퀘스트 설계자야.  
지금 너는 Firebase DB에서 ${userName}의 문진 정보를 불러온 상태야.  
이 데이터를 기반으로 아래의 3단계에 따라 분석하고, 사용자 맞춤형 퀘스트를 설계해줘.

**중요! : 3단계는 사용자에게 보여주지 않아야 해. 메시지로 출력하지 마.**

---

📌 1단계: 변화 단계 분류  
Firebase에서 불러온 ${userName}의 문진 데이터를 분석해, 사용자가 변화 단계 모델 중 어디에 해당하는지 판단해줘.  
(무관심기 / 숙고기 / 준비기 / 행동기 / 유지기 중 하나)  
해당 판단의 근거도 간단하게 설명해줘.

---

📌 2단계: 퀘스트 3개 생성  
해당 변화 단계와 문진 내용을 고려해서 ${userName}에게 적절한 퀘스트 3개를 설계해줘.  
퀘스트는 다음 조건을 따라 작성해:

- 무리한 외출이나 과도한 사회 활동은 ❌  
- 사용자의 관심사나 디지털 습관을 반영한 방향은 ⭕

퀘스트 형식은 아래 양식을 반드시 따르도록 해:

- 퀘스트 제목:  
- 해금 조건:  
- 달성 조건:  
- 보상:  

퀘스트는 작고 실현 가능한 행동부터 시작해, 작은 성공 경험을 줄 수 있도록 설계해줘.

---

📌 3단계: JSON 형태로 정리
최종 결과를 다음 형식으로 JSON으로 정리해줘. Firebase DB에 저장할 거야. **3단계는 사용자에게 보여주지마.**:

{
  "name": "${userName}",
  "stage": "변화 단계 결과 (예: 준비기)",
  "quests": [
    {
      "title": "퀘스트 제목",
      "unlock_condition": "해금 조건",
      "completion_condition": "달성 조건",
      "reward": "보상"
    },
    ...
  ]
}
`;

  // OpenAI API 호출
  private static async callOpenAI(messages: ChatMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
          max_tokens: 1500,
          temperature: 0.7,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';
    } catch (error) {
      console.error('OpenAI API 호출 오류:', error);
      throw new Error('AI 응답 생성에 실패했습니다.');
    }
  }

  // 문진 응답 생성
  static async generateAssessmentResponse(
    userResponse: string,
    currentQuestion: string,
    questionCategory: string,
    progressPercent: number
  ): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.assessmentSystemPrompt },
      { 
        role: 'user', 
        content: `
현재 문진 상황:
- 카테고리: ${questionCategory}
- 질문: ${currentQuestion}
- 사용자 응답: ${userResponse}
- 진행률: ${progressPercent}%

사용자의 응답에 대해 따뜻한 피드백을 1-2문장으로 제공해줘.
` 
      }
    ];

    return await this.callOpenAI(messages);
  }

  // 🆕 메인 퀘스트 생성 함수 - Firebase 데이터 기반 AI 퀘스트 생성
  static async generateQuestsFromFirebaseData(
    userName: string,
    userData: UserData,
    previousQuests?: QuestData[]
  ): Promise<string> {
    // 이전 퀘스트 요약 정보 생성
    const questHistory = previousQuests && previousQuests.length > 0 
      ? previousQuests.map(questData => ({
          createdAt: questData.createdAt,
          stage: questData.stage,
          completed: questData.quests.filter(q => q.completed).length,
          total: questData.quests.length,
          questTitles: questData.quests.map(q => `${q.title} (${q.completed ? '완료' : '미완료'})`).join(', ')
        }))
      : [];

    const messages: ChatMessage[] = [
      { role: 'system', content: this.getQuestSystemPrompt(userName) },
      { 
        role: 'user', 
        content: `
🔥 Firebase DB에서 불러온 ${userName}님의 문진 정보:

📋 기본 정보:
- 이름: ${userData.name}
- 나이: ${userData.age}세
- 성별: ${userData.gender}
- 거주 형태: ${userData.residence.livingSituation}
- 거주 환경: ${userData.residence.environment}

🏠 은둔 상태:
- 시작 시점: ${userData.hikikomoriStatus.startDate}
- 일일 방밖 활동: ${userData.hikikomoriStatus.avgOutTimePerDay}
- 최근 한달 외출: ${userData.hikikomoriStatus.outingsLastMonth}회
- 주요 외출지: ${userData.hikikomoriStatus.usualDestinations.join(', ')}

🧠 심리/정서 상태:
- 외출 불안감: ${userData.mentalState.anxietyLevel}/5
- 사회적 부담감: ${userData.mentalState.socialDiscomfort}
- 정서적 어려움: ${userData.mentalState.emotionalIssues.join(', ')}
- 자기효능감: ${userData.mentalState.selfEfficacy}

💻 디지털 사용:
- 일일 사용시간: ${userData.digitalBehavior.dailyScreenTime}
- 주요 플랫폼: ${userData.digitalBehavior.platforms.join(', ')}
- 온라인 관계: ${userData.digitalBehavior.onlineConnections}

🎯 관심사:
- 좋아하는 것: ${userData.interests.likes.join(', ')}
- 목표/희망: ${userData.interests.goals}
- 싫어하는 것: ${userData.interests.dislikes.join(', ')}

💪 건강 상태:
- 만성질환: ${userData.health.chronicConditions}
- 생활습관: ${userData.health.lifestyle}
- 신체능력: ${userData.health.physicalAbility}
- 복용약물: ${userData.health.medication}

📈 과거 경험:
- 외출 시도 경험: ${userData.pastExperiences.triedToGoOut ? '있음' : '없음'}
- 동기 요인: ${userData.pastExperiences.motivators.join(', ')}
- 실패 요인: ${userData.pastExperiences.failReasons.join(', ')}

${questHistory.length > 0 ? `
🎮 이전 퀘스트 히스토리:
${questHistory.map((history, index) => 
  `${index + 1}차 퀘스트 (${history.stage}): ${history.completed}/${history.total} 완료
  - 퀘스트 목록: ${history.questTitles}`
).join('\n')}
` : '🎮 이전 퀘스트 기록: 없음 (첫 퀘스트 생성)'}

---

위 데이터를 바탕으로 3단계 분석을 진행하고 맞춤형 퀘스트를 설계해줘!
` 
      }
    ];

    return await this.callOpenAI(messages);
  }

  // 퀘스트 완료 축하 메시지 생성
  static async generateQuestCompletionMessage(
    questTitle: string,
    questReward: string,
    userProgress: { completed: number; total: number }
  ): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: this.getQuestSystemPrompt('사용자') },
      { 
        role: 'user', 
        content: `
사용자가 퀘스트를 완료했어:
- 완료한 퀘스트: ${questTitle}
- 획득 보상: ${questReward}
- 전체 진행률: ${userProgress.completed}/${userProgress.total}

축하 메시지와 격려의 말을 해줘! 게임적 요소를 활용해서 재미있게!
` 
      }
    ];

    return await this.callOpenAI(messages);
  }

  // 퀘스트 추천 메시지 생성
  static async generateQuestRecommendation(
    userData: UserData,
    currentStage: ChangeStage,
    previousQuests?: QuestData[]
  ): Promise<string> {
    const completedQuestsCount = previousQuests?.reduce((total, questData) => 
      total + questData.quests.filter(q => q.completed).length, 0
    ) || 0;

    const messages: ChatMessage[] = [
      { role: 'system', content: this.getQuestSystemPrompt(userData.name) },
      { 
        role: 'user', 
        content: `
사용자 정보:
- 이름: ${userData.name}
- 현재 단계: ${currentStage}
- 완료한 퀘스트 수: ${completedQuestsCount}
- 관심사: ${userData.interests?.likes?.join(', ') || '없음'}
- 외출 불안감: ${userData.mentalState?.anxietyLevel}/5

새로운 퀘스트를 추천하면서 동기 부여하는 메시지를 작성해줘.
` 
      }
    ];

    return await this.callOpenAI(messages);
  }

  // 일반적인 대화 응답 생성
  static async generateChatResponse(
    userMessage: string,
    context: 'assessment' | 'quest',
    userData?: Partial<UserData>
  ): Promise<string> {
    const systemPrompt = context === 'assessment' 
      ? this.assessmentSystemPrompt 
      : this.getQuestSystemPrompt(userData?.name || '사용자');

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `
사용자 메시지: ${userMessage}
컨텍스트: ${context}
${userData ? `사용자명: ${userData.name}` : ''}

적절한 응답을 해줘.
` 
      }
    ];

    return await this.callOpenAI(messages);
  }

  // API 키 검증
  static validateApiKey(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('sk-');
  }
}