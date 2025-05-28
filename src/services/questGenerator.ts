// services/questGenerator.ts
import { UserData, QuestData, ChangeStage, Quest } from '../types';

export class QuestGenerator {
  // 변화 단계 결정
  static determineChangeStage(userData: UserData): ChangeStage {
    const { mentalState, hikikomoriStatus, pastExperiences } = userData;
    
    // 무관심기: 외출 시도 경험 없고 불안감 높음
    if (!pastExperiences.triedToGoOut && mentalState.anxietyLevel >= 4) {
      return 'precontemplation';
    }
    
    // 숙고기: 외출 시도했지만 실패 경험 있음
    if (pastExperiences.triedToGoOut && pastExperiences.failReasons.length > 0) {
      return 'contemplation';
    }
    
    // 행동기: 월 3회 이상 외출
    if (hikikomoriStatus.outingsLastMonth > 3) {
      return 'action';
    }
    
    // 유지기: 월 5회 이상 외출하고 자기효능감 높음
    if (hikikomoriStatus.outingsLastMonth >= 5 && 
        (mentalState.selfEfficacy.includes('높') || mentalState.selfEfficacy.includes('좋'))) {
      return 'maintenance';
    }
    
    // 준비기: 기본값
    return 'preparation';
  }

  // 단계별 근거 설명
  static getStageReason(userData: UserData, stage: ChangeStage): string {
    const reasons: Record<ChangeStage, string> = {
      precontemplation: "외출 시도 경험이 없고 불안감이 높아 변화에 대한 관심이 낮은 상태입니다.",
      contemplation: "외출을 시도했지만 실패 경험이 있어 변화의 필요성을 인식하고 있는 상태입니다.",
      preparation: "최근 소수의 외출 경험이 있어 변화를 위한 준비를 하고 있는 상태입니다.",
      action: "정기적인 외출이 가능해 실제 행동 변화를 실천하고 있는 상태입니다.",
      maintenance: "꾸준한 외출과 높은 자기효능감으로 긍정적 변화를 유지하고 있는 상태입니다."
    };
    
    return reasons[stage];
  }

  // 기존 퀘스트를 고려한 새로운 퀘스트 생성
  static generateQuests(
    userData: UserData, 
    stage: ChangeStage, 
    previousQuests?: QuestData[]
  ): Quest[] {
    const baseQuests = this.getBaseQuestsByStage(userData, stage);
    
    // 이전 퀘스트가 있다면 진행도를 고려하여 조정
    if (previousQuests && previousQuests.length > 0) {
      return this.adjustQuestsBasedOnHistory(baseQuests, previousQuests, userData);
    }
    
    return baseQuests;
  }

  // 단계별 기본 퀘스트 생성
  private static getBaseQuestsByStage(userData: UserData, stage: ChangeStage): Quest[] {
    const { interests, digitalBehavior } = userData;
    
    const questTemplates = {
      precontemplation: [
        {
          title: "좋아하는 콘텐츠 감상하기",
          unlock_condition: "즉시 시작 가능",
          completion_condition: `${interests.likes?.[0] || '관심 콘텐츠'} 관련 영상/음악 30분 감상`,
          reward: "성취감 포인트 +10"
        },
        {
          title: "창문 근처에서 시간 보내기",
          unlock_condition: "첫 번째 퀘스트 완료 후",
          completion_condition: "창문 근처에서 5분간 밖을 바라보며 휴식",
          reward: "자연광 보너스 +15"
        },
        {
          title: "온라인 소통 시도하기",
          unlock_condition: "두 번째 퀘스트 완료 후",
          completion_condition: `${digitalBehavior.platforms?.[0] || '온라인 플랫폼'}에서 긍정적인 댓글 1개 작성`,
          reward: "소통 경험치 +20"
        }
      ],
      contemplation: [
        {
          title: "실내 가벼운 운동하기",
          unlock_condition: "컨디션이 좋은 날",
          completion_condition: "스트레칭이나 간단한 운동 10분 실시",
          reward: "체력 회복 +15"
        },
        {
          title: "관심사 탐구하기",
          unlock_condition: "즉시 시작 가능",
          completion_condition: `${interests.goals || '관심 있는 활동'} 관련 정보 1시간 탐색`,
          reward: "지식 경험치 +25"
        },
        {
          title: "짧은 외출 계획 세우기",
          unlock_condition: "앞선 퀘스트 완료 후",
          completion_condition: "가까운 거리 외출 계획을 구체적으로 작성하기",
          reward: "계획 수립 보너스 +30"
        }
      ],
      preparation: [
        {
          title: "집 앞 짧은 산책",
          unlock_condition: "날씨가 좋은 날",
          completion_condition: "집 앞에서 10분간 신선한 공기 마시기",
          reward: "체력 회복 +20"
        },
        {
          title: "필수 용품 구매하기",
          unlock_condition: "컨디션 양호한 날",
          completion_condition: "가까운 편의점이나 마트에서 필요한 물건 구매",
          reward: "실생활 적응 +35"
        },
        {
          title: "온라인 친구와 소통하기",
          unlock_condition: "즉시 시작 가능",
          completion_condition: "온라인 친구와 30분 이상 대화하기",
          reward: "사회성 경험치 +40"
        }
      ],
      action: [
        {
          title: "새로운 장소 탐험하기",
          unlock_condition: "컨디션이 좋은 날",
          completion_condition: "평소 가지 않던 근처 장소 1곳 방문하기",
          reward: "탐험 경험치 +45"
        },
        {
          title: "취미 활동 실천하기",
          unlock_condition: "즉시 시작 가능",
          completion_condition: `${interests.likes?.[0] || '관심사'} 관련 실제 활동 2시간 진행`,
          reward: "창작 포인트 +50"
        },
        {
          title: "카페나 도서관 이용하기",
          unlock_condition: "앞선 퀘스트들 완료 후",
          completion_condition: "공공장소에서 1시간 이상 머물며 활동하기",
          reward: "사회 적응 +55"
        }
      ],
      maintenance: [
        {
          title: "정기적인 외출 루틴 만들기",
          unlock_condition: "매주 실행",
          completion_condition: "일주일에 3회 이상 외출하기",
          reward: "루틴 마스터 +60"
        },
        {
          title: "새로운 사람과 대화하기",
          unlock_condition: "사회적 준비 완료 시",
          completion_condition: "모르는 사람과 5분 이상 자연스러운 대화",
          reward: "사회성 마스터 +70"
        },
        {
          title: "목표 활동 도전하기",
          unlock_condition: "자신감 충분할 때",
          completion_condition: `${interests.goals || '목표 활동'}에 실제로 도전해보기`,
          reward: "성취 마스터 +100"
        }
      ]
    };

    return questTemplates[stage].map((template, index) => ({
      id: `quest_${stage}_${index + 1}`,
      ...template,
      completed: false
    }));
  }

  // 퀘스트 히스토리를 바탕으로 퀘스트 조정
  private static adjustQuestsBasedOnHistory(
    baseQuests: Quest[], 
    previousQuests: QuestData[], 
    userData: UserData
  ): Quest[] {
    const completedQuestTypes = new Set<string>();
    let totalCompletedQuests = 0;
    
    // 이전 퀘스트 분석
    previousQuests.forEach(questData => {
      questData.quests.forEach(quest => {
        if (quest.completed) {
          completedQuestTypes.add(quest.title.split(' ')[0]); // 첫 번째 단어로 타입 구분
          totalCompletedQuests++;
        }
      });
    });

    // 완료된 퀘스트 수에 따라 난이도 조정
    const difficultyMultiplier = Math.min(1 + (totalCompletedQuests * 0.1), 2);
    
    return baseQuests.map(quest => {
      // 이미 완료한 유형의 퀘스트는 난이도 상승
      const questType = quest.title.split(' ')[0];
      if (completedQuestTypes.has(questType)) {
        return {
          ...quest,
          title: `${quest.title} (향상된 버전)`,
          completion_condition: this.enhanceQuestCondition(quest.completion_condition),
          reward: this.enhanceReward(quest.reward, difficultyMultiplier)
        };
      }
      
      return quest;
    });
  }

  // 퀘스트 조건 강화
  private static enhanceQuestCondition(condition: string): string {
    const timePattern = /(\d+)분/g;
    const enhancedCondition = condition.replace(timePattern, (match, time) => {
      const newTime = Math.ceil(parseInt(time) * 1.5);
      return `${newTime}분`;
    });
    
    return enhancedCondition !== condition ? enhancedCondition : `${condition} (더 적극적으로)`;
  }

  // 보상 강화
  private static enhanceReward(reward: string, multiplier: number): string {
    const pointPattern = /\+(\d+)/g;
    return reward.replace(pointPattern, (match, points) => {
      const newPoints = Math.ceil(parseInt(points) * multiplier);
      return `+${newPoints}`;
    });
  }
}