// pages/AssessmentPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FirebaseAPI } from '../api/firebaseAPI';
import { OpenAIService } from '../services/openaiService';
import { UserData, Message, AssessmentQuestion } from '../types';
import { generateMessageId } from '../utils';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 414px;
  margin: 0 auto;
  height: 100vh;
  background: ${props => props.theme.colors.white};
`;

const Header = styled.header`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.purple[300]} 100%);
  color: ${props => props.theme.colors.white};
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(163, 50, 255, 0.1);
`;

const Title = styled.h1`
  ${props => props.theme.typography.T2}
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.T6}
  opacity: 0.9;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${props => props.theme.colors.gray[200]};
  margin-top: 16px;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background: ${props => props.theme.colors.white};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageContainer = styled.div<{ isBot?: boolean }>`
  display: flex;
  justify-content: ${props => props.isBot ? 'flex-start' : 'flex-end'};
  animation: fadeInUp 0.3s ease;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageBubble = styled.div<{ isBot?: boolean }>`
  max-width: 75%;
  padding: 16px 20px;
  border-radius: ${props => props.isBot ? '20px 20px 20px 4px' : '20px 20px 4px 20px'};
  ${props => props.theme.typography.T6}
  background: ${props => props.isBot ? props.theme.colors.gray[100] : props.theme.colors.primary};
  color: ${props => props.isBot ? props.theme.colors.black : props.theme.colors.white};
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    ${props => props.isBot ? 'left: -8px' : 'right: -8px'};
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-top-color: ${props => props.isBot ? props.theme.colors.gray[100] : props.theme.colors.primary};
    border-bottom: 0;
    transform: ${props => props.isBot ? 'rotate(-45deg)' : 'rotate(45deg)'};
  }
`;

const InputContainer = styled.form`
  padding: 20px;
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: ${props => props.theme.colors.white};
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 48px;
  max-height: 120px;
  padding: 14px 18px;
  border: 2px solid ${props => props.theme.colors.gray[200]};
  border-radius: 24px;
  ${props => props.theme.typography.T6}
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray[300]};
  }
`;

const SendButton = styled.button`
  width: 48px;
  height: 48px;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.purple[300]};
    transform: scale(1.05);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray[300]};
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusIndicator = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.isActive ? props.theme.colors.green[600] : props.theme.colors.gray[300]};
  color: ${props => props.theme.colors.white};
  border-radius: 20px;
  ${props => props.theme.typography.T7}
  margin-bottom: 16px;
  align-self: flex-start;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.theme.colors.gray[300]};
    animation: bounce 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
  
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    } 40% {
      transform: scale(1);
    }
  }
`;

// 문진 질문 데이터
const assessmentQuestions: AssessmentQuestion[] = [
  // 기본 프로파일 정보
  { category: "기본 프로파일", question: "안녕하세요! 먼저 성함을 알려주세요. (정확히 이름 석 자만 입력해주세요!)", key: "name" },
  { category: "기본 프로파일", question: "나이를 알려주세요. (정확히 숫자만 입력해주세요!)", key: "age" },
  { category: "기본 프로파일", question: "성별을 알려주세요. (예: 남성/여성)", key: "gender" },
  { category: "기본 프로파일", question: "현재 어떤 형태로 거주하고 계신가요? (예: 1인 가구, 가족과 거주 등)", key: "livingSituation" },
  { category: "기본 프로파일", question: "거주지 유형을 알려주세요. (예: 도시/시골, 고층아파트/주택 등)", key: "environment" },
  
  // 은둔 상태 정보
  { category: "은둔 상태", question: "은둔 생활을 시작하신 시점이 언제인지 알려주세요. (예: 2022년 5월부터 등)", key: "startDate" },
  { category: "은둔 상태", question: "하루 평균 방 밖에서 활동하는 시간은 얼마나 되나요?", key: "avgOutTimePerDay" },
  { category: "은둔 상태", question: "최근 한 달간 외출하신 횟수를 알려주세요.", key: "outingsLastMonth" },
  { category: "은둔 상태", question: "외출하실 때 주로 어디에 가시나요? (예: 편의점, 병원, 아예 안 감 등)", key: "usualDestinations" },
  
  // 심리 및 정서 상태
  { category: "심리/정서", question: "외출에 대한 불안감은 1~5점 중 어느 정도인가요? (1: 전혀 없음, 5: 매우 심함)", key: "anxietyLevel" },
  { category: "심리/정서", question: "타인과 대화나 접촉에 대한 부담감이 있나요? 있다면 어떤 상황이 특히 부담스러운지 알려주세요.", key: "socialDiscomfort" },
  { category: "심리/정서", question: "최근 한 달간 우울, 불면, 불안 등의 정서적 어려움을 경험하셨나요?", key: "emotionalIssues" },
  { category: "심리/정서", question: "자기효능감(내가 할 수 있다는 느낌)이나 자존감은 어떤 편인가요?", key: "selfEfficacy" },
  
  // 디지털 사용 행태
  { category: "디지털 사용", question: "하루에 스마트폰이나 PC를 얼마나 사용하시나요?", key: "dailyScreenTime" },
  { category: "디지털 사용", question: "자주 사용하는 앱이나 플랫폼은 무엇인가요?", key: "platforms" },
  { category: "디지털 사용", question: "온라인에서 관계를 맺고 있는 사람이 있나요? (예: 게임 친구, 커뮤니티 친구 등)", key: "onlineConnections" },
  
  // 흥미 및 관심사
  { category: "흥미/관심사", question: "요즘 좋아하는 콘텐츠가 있다면 알려주세요. (예: 장르, 게임, 음악 등)", key: "likes" },
  { category: "흥미/관심사", question: "막연하게라도 하고 싶은 일이 있나요?", key: "goals" },
  { category: "흥미/관심사", question: "싫어하거나 피하는 활동, 장소, 사람 유형이 있다면 알려주세요.", key: "dislikes" },
  
  // 건강 및 체력
  { category: "건강/체력", question: "만성질환이 있으신가요?", key: "chronicConditions" },
  { category: "건강/체력", question: "수면과 식사 습관은 어떤 편인가요?", key: "lifestyle" },
  { category: "건강/체력", question: "간단한 산책이나 가벼운 활동은 가능한가요?", key: "physicalAbility" },
  { category: "건강/체력", question: "현재 복용 중인 약이 있나요?", key: "medication" },
  
  // 과거 성공/실패 경험
  { category: "과거 경험", question: "이전에 외출을 시도해본 적이 있나요?", key: "triedToGoOut" },
  { category: "과거 경험", question: "어떤 계기로 나간 적이 있나요?", key: "motivators" },
  { category: "과거 경험", question: "시도했지만 실패하거나 중단한 이유가 있다면 말씀해주세요.", key: "failReasons" }
];

interface AssessmentPageProps {
  onComplete: (userData: UserData) => void;
}

const AssessmentPage: React.FC<AssessmentPageProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [hasAskedFirstQuestion, setHasAskedFirstQuestion] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const progress = (currentQuestionIndex / assessmentQuestions.length) * 100;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 초기 설정 useEffect
  useEffect(() => {
    // 초기 인사말
    const initialMessage: Message = {
      id: '0',
      text: "안녕하세요! 저는 히키코모리 회복 지원 앱의 스마트 상담사입니다. 😊\n\n회복 여정을 위한 문진을 진행해드릴게요. 편안하게 답변해주시면 됩니다.\n\n언제든지 힘들면 '잠깐'이라고 말씀해주세요.",
      isBot: true,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    
    // 첫 번째 질문 시작
    setTimeout(() => {
      askCurrentQuestion();
      setHasAskedFirstQuestion(true);
    }, 2000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // currentQuestionIndex가 변경될 때마다 질문 물어보기
  useEffect(() => {
    if (hasAskedFirstQuestion && currentQuestionIndex < assessmentQuestions.length) {
      setTimeout(() => {
        askCurrentQuestion();
      }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, hasAskedFirstQuestion]);

  const addMessage = (text: string, isBot: boolean = false) => {
    const newMessage: Message = {
      id: generateMessageId(),
      text,
      isBot,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const askCurrentQuestion = () => {
    if (currentQuestionIndex >= assessmentQuestions.length) return;
    
    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    addMessage(`[${currentQuestion.category}]\n\n${currentQuestion.question}`, true);
  };

  const processResponse = async (response: string) => {
    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    
    // 응답 데이터 저장
    const newUserData = { ...userData };
    
    // 데이터 매핑 (기존 코드와 동일)
    switch (currentQuestion.key) {
      case 'name':
        newUserData.name = response;
        break;
      case 'age':
        newUserData.age = parseInt(response) || 0;
        break;
      case 'gender':
        newUserData.gender = response;
        break;
      case 'livingSituation':
        if (!newUserData.residence) newUserData.residence = { livingSituation: '', environment: '' };
        newUserData.residence.livingSituation = response;
        break;
      case 'environment':
        if (!newUserData.residence) newUserData.residence = { livingSituation: '', environment: '' };
        newUserData.residence.environment = response;
        break;
      case 'startDate':
        if (!newUserData.hikikomoriStatus) {
          newUserData.hikikomoriStatus = {
            startDate: '',
            avgOutTimePerDay: '',
            outingsLastMonth: 0,
            usualDestinations: []
          };
        }
        newUserData.hikikomoriStatus.startDate = response;
        break;
      case 'avgOutTimePerDay':
        if (!newUserData.hikikomoriStatus) {
          newUserData.hikikomoriStatus = {
            startDate: '',
            avgOutTimePerDay: '',
            outingsLastMonth: 0,
            usualDestinations: []
          };
        }
        newUserData.hikikomoriStatus.avgOutTimePerDay = response;
        break;
      case 'outingsLastMonth':
        if (!newUserData.hikikomoriStatus) {
          newUserData.hikikomoriStatus = {
            startDate: '',
            avgOutTimePerDay: '',
            outingsLastMonth: 0,
            usualDestinations: []
          };
        }
        newUserData.hikikomoriStatus.outingsLastMonth = parseInt(response) || 0;
        break;
      case 'usualDestinations':
        if (!newUserData.hikikomoriStatus) {
          newUserData.hikikomoriStatus = {
            startDate: '',
            avgOutTimePerDay: '',
            outingsLastMonth: 0,
            usualDestinations: []
          };
        }
        newUserData.hikikomoriStatus.usualDestinations = response.split(',').map(s => s.trim());
        break;
      case 'anxietyLevel':
        if (!newUserData.mentalState) {
          newUserData.mentalState = {
            anxietyLevel: 1,
            socialDiscomfort: '',
            emotionalIssues: [],
            selfEfficacy: ''
          };
        }
        newUserData.mentalState.anxietyLevel = parseInt(response) || 1;
        break;
      case 'socialDiscomfort':
        if (!newUserData.mentalState) {
          newUserData.mentalState = {
            anxietyLevel: 1,
            socialDiscomfort: '',
            emotionalIssues: [],
            selfEfficacy: ''
          };
        }
        newUserData.mentalState.socialDiscomfort = response;
        break;
      case 'emotionalIssues':
        if (!newUserData.mentalState) {
          newUserData.mentalState = {
            anxietyLevel: 1,
            socialDiscomfort: '',
            emotionalIssues: [],
            selfEfficacy: ''
          };
        }
        newUserData.mentalState.emotionalIssues = response.split(',').map(s => s.trim());
        break;
      case 'selfEfficacy':
        if (!newUserData.mentalState) {
          newUserData.mentalState = {
            anxietyLevel: 1,
            socialDiscomfort: '',
            emotionalIssues: [],
            selfEfficacy: ''
          };
        }
        newUserData.mentalState.selfEfficacy = response;
        break;
      case 'dailyScreenTime':
        if (!newUserData.digitalBehavior) {
          newUserData.digitalBehavior = {
            dailyScreenTime: '',
            platforms: [],
            onlineConnections: ''
          };
        }
        newUserData.digitalBehavior.dailyScreenTime = response;
        break;
      case 'platforms':
        if (!newUserData.digitalBehavior) {
          newUserData.digitalBehavior = {
            dailyScreenTime: '',
            platforms: [],
            onlineConnections: ''
          };
        }
        newUserData.digitalBehavior.platforms = response.split(',').map(s => s.trim());
        break;
      case 'onlineConnections':
        if (!newUserData.digitalBehavior) {
          newUserData.digitalBehavior = {
            dailyScreenTime: '',
            platforms: [],
            onlineConnections: ''
          };
        }
        newUserData.digitalBehavior.onlineConnections = response;
        break;
      case 'likes':
        if (!newUserData.interests) {
          newUserData.interests = {
            likes: [],
            goals: '',
            dislikes: []
          };
        }
        newUserData.interests.likes = response.split(',').map(s => s.trim());
        break;
      case 'goals':
        if (!newUserData.interests) {
          newUserData.interests = {
            likes: [],
            goals: '',
            dislikes: []
          };
        }
        newUserData.interests.goals = response;
        break;
      case 'dislikes':
        if (!newUserData.interests) {
          newUserData.interests = {
            likes: [],
            goals: '',
            dislikes: []
          };
        }
        newUserData.interests.dislikes = response.split(',').map(s => s.trim());
        break;
      case 'chronicConditions':
        if (!newUserData.health) {
          newUserData.health = {
            chronicConditions: '',
            lifestyle: '',
            physicalAbility: '',
            medication: ''
          };
        }
        newUserData.health.chronicConditions = response;
        break;
      case 'lifestyle':
        if (!newUserData.health) {
          newUserData.health = {
            chronicConditions: '',
            lifestyle: '',
            physicalAbility: '',
            medication: ''
          };
        }
        newUserData.health.lifestyle = response;
        break;
      case 'physicalAbility':
        if (!newUserData.health) {
          newUserData.health = {
            chronicConditions: '',
            lifestyle: '',
            physicalAbility: '',
            medication: ''
          };
        }
        newUserData.health.physicalAbility = response;
        break;
      case 'medication':
        if (!newUserData.health) {
          newUserData.health = {
            chronicConditions: '',
            lifestyle: '',
            physicalAbility: '',
            medication: ''
          };
        }
        newUserData.health.medication = response;
        break;
      case 'triedToGoOut':
        if (!newUserData.pastExperiences) {
          newUserData.pastExperiences = {
            triedToGoOut: false,
            motivators: [],
            failReasons: []
          };
        }
        newUserData.pastExperiences.triedToGoOut = 
          response.toLowerCase().includes('네') || 
          response.toLowerCase().includes('예') || 
          response.toLowerCase().includes('있');
        break;
      case 'motivators':
        if (!newUserData.pastExperiences) {
          newUserData.pastExperiences = {
            triedToGoOut: false,
            motivators: [],
            failReasons: []
          };
        }
        newUserData.pastExperiences.motivators = response.split(',').map(s => s.trim());
        break;
      case 'failReasons':
        if (!newUserData.pastExperiences) {
          newUserData.pastExperiences = {
            triedToGoOut: false,
            motivators: [],
            failReasons: []
          };
        }
        newUserData.pastExperiences.failReasons = response.split(',').map(s => s.trim());
        break;
    }
    
    setUserData(newUserData);
    
    // 다음 질문으로 이동 또는 완료
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      // 응답에 대한 AI 피드백 또는 기본 격려 메시지
      try {
        let feedbackMessage = "";
        
        if (OpenAIService.validateApiKey()) {
          feedbackMessage = await OpenAIService.generateAssessmentResponse(
            response,
            currentQuestion.question,
            currentQuestion.category,
            progress
          );
        } else {
          // 기본 격려 메시지
          const encouragements = [
            "답변해주셔서 감사합니다! 😊",
            "잘하고 계세요! 👍",
            "소중한 정보네요!",
            "계속해서 차근차근 진행해볼게요.",
            "훌륭합니다! 🌟"
          ];
          feedbackMessage = encouragements[Math.floor(Math.random() * encouragements.length)];
        }
        
        setTimeout(() => {
          addMessage(feedbackMessage, true);
          // 다음 질문으로 이동
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
          }, 1000);
        }, 500);
        
      } catch (error) {
        // AI 피드백 실패 시 기본 격려 메시지
        const encouragements = [
          "답변해주셔서 감사합니다! 😊",
          "잘하고 계세요! 👍",
          "소중한 정보네요!",
          "계속해서 차근차근 진행해볼게요.",
          "훌륭합니다! 🌟"
        ];
        
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        
        setTimeout(() => {
          addMessage(randomEncouragement, true);
          setTimeout(() => {
            setCurrentQuestionIndex(prev => prev + 1);
          }, 1000);
        }, 500);
      }
      
    } else {
      // 문진 완료
      setAssessmentComplete(true);
      setTimeout(() => {
        addMessage("문진이 모두 완료되었습니다! 🎉\n\n정말 수고하셨어요. 답변해주신 소중한 정보를 바탕으로 데이터를 저장하고 맞춤형 지원을 준비해드릴게요.\n\n데이터를 저장하고 다음 단계로 진행하시겠어요?", true);
      }, 1000);
    }
  };

  const completeAssessment = async () => {
    try {
      setIsProcessing(true);
      
      const completeUserData = userData as UserData;
      
      // Firebase에 저장
      await FirebaseAPI.saveUserData(completeUserData);
      
      addMessage("데이터가 성공적으로 저장되었습니다! 📊\n\n이제 맞춤형 퀘스트 생성 단계로 이동합니다. 잠시만 기다려주세요...", true);
      
      setTimeout(() => {
        onComplete(completeUserData);
      }, 2000);
      
    } catch (error) {
      addMessage("데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요. 😥", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    const userMessage = inputValue.trim();
    addMessage(userMessage, false);
    setInputValue('');
    setIsProcessing(true);
    
    // 잠시 휴식 요청 처리
    if (userMessage.toLowerCase().includes('잠깐') || userMessage.toLowerCase().includes('휴식')) {
      setTimeout(() => {
        addMessage("네, 충분히 쉬어가세요. 😌\n\n언제든 준비되시면 계속 진행하시면 됩니다. 무리하지 마세요!", true);
        setIsProcessing(false);
      }, 1000);
      return;
    }
    
    try {
      if (assessmentComplete) {
        if (userMessage.toLowerCase().includes('네') || 
            userMessage.toLowerCase().includes('예') || 
            userMessage.toLowerCase().includes('진행')) {
          await completeAssessment();
        } else {
          addMessage("진행을 원하시면 '네' 또는 '진행해주세요'라고 말씀해주세요. 😊", true);
          setIsProcessing(false);
        }
      } else {
        await processResponse(userMessage);
        setIsProcessing(false);
      }
    } catch (error) {
      addMessage("처리 중 오류가 발생했습니다. 다시 시도해주세요.", true);
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // 자동 높이 조절
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>회복 여정 문진</Title>
        <Subtitle>스마트 상담사와 함께하는 맞춤형 상담</Subtitle>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
      </Header>
      
      <ChatContainer>
        <StatusIndicator isActive={!isProcessing}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: 'currentColor' 
          }} />
          {isProcessing ? '처리 중...' : '대화 가능'}
        </StatusIndicator>
        
        {messages.map((message) => (
          <MessageContainer key={message.id} isBot={message.isBot}>
            <MessageBubble isBot={message.isBot}>
              {message.text}
            </MessageBubble>
          </MessageContainer>
        ))}
        
        {isProcessing && (
          <MessageContainer isBot>
            <MessageBubble isBot>
              <LoadingDots>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </LoadingDots>
            </MessageBubble>
          </MessageContainer>
        )}
        
        <div ref={messagesEndRef} />
      </ChatContainer>
      
      <InputContainer onSubmit={handleSubmit}>
        <TextArea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            assessmentComplete 
              ? "데이터 저장하고 다음 단계로 진행하시겠어요? (네/아니오)" 
              : "답변을 입력해주세요... (언제든 '잠깐'이라고 하시면 휴식할 수 있어요)"
          }
          disabled={isProcessing}
          rows={1}
        />
        <SendButton type="submit" disabled={!inputValue.trim() || isProcessing}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </SendButton>
      </InputContainer>
    </PageContainer>
  );
};

export default AssessmentPage;