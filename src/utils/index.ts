// utils/index.ts

// 고유한 ID 생성 함수
export const generateUniqueId = (prefix = ''): string => {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 9);
  const performanceNow = performance.now().toString().replace('.', '');
  
  return `${prefix}${timestamp}_${randomPart}_${performanceNow}`;
};

// 메시지 ID 생성 (메시지 전용)
export const generateMessageId = (): string => {
  return generateUniqueId('msg_');
};

// 퀘스트 ID 생성 (퀘스트 전용)
export const generateQuestId = (): string => {
  return generateUniqueId('quest_');
};

// 사용자 세션 ID 생성
export const generateSessionId = (): string => {
  return generateUniqueId('session_');
};

// 지연 함수 (비동기 처리용)
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 안전한 JSON 파싱
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    const result = JSON.parse(jsonString);
    return result !== null && result !== undefined ? result : fallback;
  } catch (error) {
    console.warn('JSON 파싱 실패:', error);
    return fallback;
  }
};

// 텍스트에서 JSON 추출 (개선된 버전)
export const extractJsonFromText = (text: string): string | null => {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // 1. ```json ... ``` 패턴 찾기 (가장 우선)
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    return jsonBlockMatch[1].trim();
  }

  // 2. ``` ... ``` 일반 코드 블록에서 JSON 찾기
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const content = codeBlockMatch[1].trim();
    if (content.startsWith('{') && content.includes('"quests"')) {
      return content;
    }
  }

  // 3. 중괄호로 시작하는 JSON 객체 찾기
  const jsonMatch = text.match(/\{[\s\S]*?\}/);
  if (jsonMatch && jsonMatch[0]) {
    const jsonCandidate = jsonMatch[0].trim();
    // 기본적인 JSON 구조 검증
    if (jsonCandidate.includes('"quests"') || jsonCandidate.includes('"stage"')) {
      return jsonCandidate;
    }
  }

  // 4. 여러 줄에 걸친 JSON 객체 찾기 (더 관대한 매칭)
  const multilineJsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
  if (multilineJsonMatch) {
    for (const candidate of multilineJsonMatch) {
      if (candidate.includes('"quests"') || candidate.includes('"stage"')) {
        return candidate.trim();
      }
    }
  }

  return null;
};