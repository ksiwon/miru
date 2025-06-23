// pages/QuestPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FirebaseAPI } from '../api/firebaseAPI';
import { QuestGenerator } from '../services/questGenerator';
import { OpenAIService } from '../services/openaiService';
import { UserData, QuestData, Message, ChangeStage } from '../types';
import { generateMessageId, generateQuestId, delay, extractJsonFromText, safeJsonParse } from '../utils';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 414px;
  margin: 0 auto;
  height: 100vh;
  background: ${props => props.theme.colors.white};
`;

const Header = styled.header`
  background: linear-gradient(135deg, ${props => props.theme.colors.turkey[600]} 0%, ${props => props.theme.colors.blue[600]} 100%);
  color: ${props => props.theme.colors.white};
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(32, 182, 182, 0.1);
`;

const Title = styled.h1`
  ${props => props.theme.typography.T2}
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.T6}
  opacity: 0.9;
`;

const UserInfo = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 12px;
  margin-top: 12px;
  ${props => props.theme.typography.T7}
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
  max-width: 80%;
  padding: 16px 20px;
  border-radius: ${props => props.isBot ? '20px 20px 20px 4px' : '20px 20px 4px 20px'};
  ${props => props.theme.typography.T6}
  background: ${props => props.isBot ? props.theme.colors.blue[100] : props.theme.colors.turkey[600]};
  color: ${props => props.isBot ? props.theme.colors.blue[600] : props.theme.colors.white};
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  line-height: 1.6;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    ${props => props.isBot ? 'left: -8px' : 'right: -8px'};
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-top-color: ${props => props.isBot ? props.theme.colors.blue[100] : props.theme.colors.turkey[600]};
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
    border-color: ${props => props.theme.colors.turkey[600]};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray[300]};
  }
`;

const SendButton = styled.button`
  width: 48px;
  height: 48px;
  background: ${props => props.theme.colors.turkey[600]};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.blue[600]};
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
    background: ${props => props.theme.colors.blue[600]};
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

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 20px;
  ${props => props.theme.typography.T7}
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.variant === 'primary' ? props.theme.colors.turkey[600] : props.theme.colors.gray[300]};
  background: ${props => props.variant === 'primary' ? props.theme.colors.turkey[600] : 'transparent'};
  color: ${props => props.variant === 'primary' ? props.theme.colors.white : props.theme.colors.gray[600]};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const stageNames: Record<ChangeStage, string> = {
  precontemplation: '무관심기',
  contemplation: '숙고기',
  preparation: '준비기',
  action: '행동기',
  maintenance: '유지기'
};

interface QuestPageProps {
  onBack: () => void;
}

const QuestPage: React.FC<QuestPageProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuests, setCurrentQuests] = useState<QuestData | null>(null);
  const [conversationState, setConversationState] = useState<'initial' | 'quest_check' | 'completed'>('initial');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeQuestGeneration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMessage = (text: string, isBot: boolean = false) => {
    const newMessage: Message = {
      id: generateMessageId(), // 유틸리티 함수 사용
      text,
      isBot,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const initializeQuestGeneration = async () => {
    setIsProcessing(true);
    
    try {
      // 환영 메시지
      addMessage(`안녕하세요! 🎮\n\n퀘스트 설계자입니다. 맞춤형 퀘스트를 생성해드릴게요.\n\n먼저 사용자 이름을 알려주세요!`, true);
      
    } catch (error) {
      addMessage("초기화 중 오류가 발생했습니다. 😥", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const processUserNameAndGenerateQuests = async (userName: string) => {
    setIsProcessing(true);
    
    try {
      addMessage(`${userName}님, 반갑습니다! 🎉\n\nFirebase에서 문진 정보를 불러오는 중...`, true);
      
      await delay(1500);
      
      // 사용자 데이터 조회
      const fetchedUserData = await FirebaseAPI.getUserData(userName);
      
      if (!fetchedUserData) {
        addMessage(`😥 ${userName}님의 문진 데이터를 찾을 수 없습니다.\n\n먼저 문진을 완료해주세요!`, true);
        return;
      }
      
      addMessage(`✅ 문진 데이터 발견!\n\n이전 퀘스트 기록을 확인하는 중...`, true);
      
      await delay(1000);
      
      // 이전 퀘스트 히스토리 조회
      const previousQuests = await FirebaseAPI.getAllQuestHistory(userName);
      
      if (previousQuests.length > 0) {
        addMessage(`📊 총 ${previousQuests.length}개의 이전 퀘스트 기록을 발견했습니다!\n\n완료된 퀘스트: ${previousQuests.reduce((total, q) => total + q.quests.filter(quest => quest.completed).length, 0)}개`, true);
      } else {
        addMessage(`🆕 첫 번째 퀘스트 생성입니다!`, true);
      }
      
      await delay(1500);
      
      // OpenAI를 사용한 퀘스트 생성
      if (OpenAIService.validateApiKey()) {
        addMessage(`🤖 AI 퀘스트 설계자가 분석을 시작합니다...\n\n${userName}님의 데이터를 바탕으로 맞춤형 퀘스트를 생성 중...`, true);
        
        try {
          const aiQuestResponse = await OpenAIService.generateQuestsFromFirebaseData(
            userName,
            fetchedUserData,
            previousQuests
          );
          
          addMessage(`🎯 **AI 퀘스트 분석 완료!**\n\n${aiQuestResponse}`, true);
          
          // AI 응답에서 JSON 파싱 시도
          try {
            const extractedJson = extractJsonFromText(aiQuestResponse);
            if (extractedJson) {
              const parsedQuestData = safeJsonParse(extractedJson, null) as any;
              
              if (parsedQuestData && parsedQuestData.quests) {
                // 퀘스트 데이터 구조 변환
                const questData: QuestData = {
                  userId: userName,
                  userName: userName,
                  stage: parsedQuestData.stage || 'preparation',
                  quests: parsedQuestData.quests.map((quest: any, index: number) => ({
                    id: generateQuestId(), // 고유한 퀘스트 ID 생성
                    title: quest.title,
                    unlock_condition: quest.unlock_condition,
                    completion_condition: quest.completion_condition,
                    reward: quest.reward,
                    completed: false
                  })),
                  createdAt: new Date()
                };
                
                // Firebase에 저장
                await FirebaseAPI.saveQuestData(questData);
                setCurrentQuests(questData);
                
                setTimeout(() => {
                  addMessage(`💾 퀘스트가 저장되었습니다!\n\n이제 퀘스트 완료 보고를 해주시면 축하와 함께 보상을 드릴게요! 🎁`, true);
                  setConversationState('quest_check');
                }, 1000);
                
              } else {
                throw new Error('퀘스트 데이터 구조가 올바르지 않습니다.');
              }
            } else {
              throw new Error('JSON 형식을 찾을 수 없습니다.');
            }
          } catch (parseError) {
            console.error('AI 응답 파싱 오류:', parseError);
            // AI 파싱 실패 시 기본 퀘스트 생성
            await fallbackQuestGeneration(fetchedUserData, previousQuests);
          }
          
        } catch (aiError) {
          console.error('AI 퀘스트 생성 오류:', aiError);
          addMessage(`AI 분석 중 오류가 발생했습니다. 기본 퀘스트를 생성합니다...`, true);
          await fallbackQuestGeneration(fetchedUserData, previousQuests);
        }
        
      } else {
        // OpenAI 없을 때 기본 퀘스트 생성
        addMessage(`🔧 기본 퀘스트 생성기로 맞춤형 퀘스트를 생성합니다...`, true);
        await fallbackQuestGeneration(fetchedUserData, previousQuests);
      }
      
    } catch (error) {
      console.error('퀘스트 생성 오류:', error);
      addMessage("퀘스트 생성 중 오류가 발생했습니다. 😥 다시 시도해주세요.", true);
    } finally {
      setIsProcessing(false);
    }
  };

  // 기본 퀘스트 생성 (AI 실패 시 fallback)
  const fallbackQuestGeneration = async (userData: UserData, previousQuests: QuestData[]) => {
    const stage = QuestGenerator.determineChangeStage(userData);
    const stageReason = QuestGenerator.getStageReason(userData, stage);
    
    addMessage(`📊 **변화 단계 분석 결과**\n\n${userData.name}님은 **${stageNames[stage]}**에 해당합니다.\n\n**분석 근거:** ${stageReason}`, true);
    
    await delay(2000);
    
    const quests = QuestGenerator.generateQuests(userData, stage, previousQuests);
    
    const questData: QuestData = {
      userId: userData.name,
      userName: userData.name,
      stage,
      quests,
      createdAt: new Date()
    };
    
    setCurrentQuests(questData);
    await FirebaseAPI.saveQuestData(questData);
    
    addMessage(`🎮 **맞춤형 퀘스트가 생성되었습니다!**\n\n총 ${quests.length}개의 퀘스트를 준비했어요.`, true);
    
    setTimeout(() => {
      displayQuestCards(questData);
    }, 1000);
  };

  const displayQuestCards = (questData: QuestData) => {
    const questCardsHtml = questData.quests.map((quest, index) => (
      `**퀘스트 ${index + 1}: ${quest.title}** ${quest.completed ? '✅' : '🎯'}\n` +
      `🔓 해금 조건: ${quest.unlock_condition}\n` +
      `✨ 달성 조건: ${quest.completion_condition}\n` +
      `🎁 보상: ${quest.reward}\n` +
      `${quest.completed ? '완료됨! 🎉' : '진행 가능'}\n`
    )).join('\n');
    
    addMessage(questCardsHtml, true);
    
    setTimeout(() => {
      addMessage("퀘스트를 완료하셨다면 언제든 말씀해주세요! 🚀\n\n예: '첫 번째 퀘스트 완료했어요' 또는 구체적인 퀘스트 제목\n\n새로운 퀘스트가 필요하시면 '새 퀘스트'라고 말씀해주세요.", true);
      setConversationState('quest_check');
    }, 2000);
  };

  const handleQuestCompletion = async (questIndex: number, questTitle: string) => {
    if (!currentQuests) return;
    
    try {
      setIsProcessing(true);
      
      const quest = currentQuests.quests[questIndex];
      
      // 완료 상태 업데이트
      if (currentQuests.id) {
        await FirebaseAPI.updateQuestCompletion(currentQuests.id, quest.id, true);
      }
      
      // 로컬 상태 업데이트
      const updatedQuests = { ...currentQuests };
      updatedQuests.quests[questIndex].completed = true;
      updatedQuests.quests[questIndex].completedAt = new Date();
      setCurrentQuests(updatedQuests);
      
      // AI 축하 메시지
      if (OpenAIService.validateApiKey()) {
        try {
          const aiCongrats = await OpenAIService.generateQuestCompletionMessage(
            questTitle,
            quest.reward,
            { 
              completed: updatedQuests.quests.filter(q => q.completed).length, 
              total: updatedQuests.quests.length 
            }
          );
          
          addMessage(aiCongrats, true);
        } catch (error) {
          // AI 메시지 실패 시 기본 축하 메시지
          const congratulations = [
            `🎉 축하합니다! "${questTitle}" 완료하셨네요!`,
            `정말 대단해요! 한 걸음 더 나아가셨습니다! 💪`,
            `완료하신 것을 보니 정말 뿌듯합니다! ⭐`,
            `훌륭합니다! 꾸준히 실천하고 계시는군요! 👏`
          ];
          
          const randomCongrats = congratulations[Math.floor(Math.random() * congratulations.length)];
          addMessage(randomCongrats, true);
        }
      } else {
        // 기본 축하 메시지
        const congratulations = [
          `🎉 축하합니다! "${questTitle}" 완료하셨네요!`,
          `정말 대단해요! 한 걸음 더 나아가셨습니다! 💪`,
          `완료하신 것을 보니 정말 뿌듯합니다! ⭐`,
          `훌륭합니다! 꾸준히 실천하고 계시는군요! 👏`
        ];
        
        const randomCongrats = congratulations[Math.floor(Math.random() * congratulations.length)];
        addMessage(randomCongrats, true);
      }
      
      // 보상 지급 메시지
      setTimeout(() => {
        addMessage(`🎁 **보상 획득!**\n${quest.reward}\n\n계속해서 다른 퀘스트도 도전해보세요!`, true);
      }, 1500);
      
    } catch (error) {
      addMessage("퀘스트 완료 처리 중 오류가 발생했습니다. 😥", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNewQuests = async () => {
    if (!currentQuests) return;
    
    setIsProcessing(true);
    
    try {
      addMessage("새로운 퀘스트를 생성하고 있습니다... 🔄", true);
      
      // 최신 퀘스트 히스토리 가져오기
      const questHistory = await FirebaseAPI.getAllQuestHistory(currentQuests.userName);
      const userData = await FirebaseAPI.getUserData(currentQuests.userName);
      
      if (!userData) {
        addMessage("사용자 데이터를 찾을 수 없습니다.", true);
        return;
      }
      
      // 새로운 퀘스트 생성 (히스토리 기반)
      const stage = QuestGenerator.determineChangeStage(userData);
      const newQuests = QuestGenerator.generateQuests(userData, stage, questHistory);
      
      const newQuestData: QuestData = {
        userId: currentQuests.userName,
        userName: currentQuests.userName,
        stage,
        quests: newQuests,
        createdAt: new Date()
      };
      
      // 저장
      await FirebaseAPI.saveQuestData(newQuestData);
      setCurrentQuests(newQuestData);
      
      addMessage(`🆕 **새로운 퀘스트가 생성되었습니다!**\n\n이전 경험을 바탕으로 더욱 발전된 퀘스트를 준비했어요!`, true);
      
      setTimeout(() => {
        displayQuestCards(newQuestData);
      }, 1000);
      
    } catch (error) {
      addMessage("새 퀘스트 생성 중 오류가 발생했습니다. 😥", true);
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
    
    try {
      // 첫 번째 상태: 사용자 이름 입력 받기
      if (conversationState === 'initial' && !currentQuests) {
        await processUserNameAndGenerateQuests(userMessage);
        return;
      }
      
      // 퀘스트 완료 체크
      if (userMessage.toLowerCase().includes('완료') || userMessage.toLowerCase().includes('했어요') || userMessage.toLowerCase().includes('끝났어요')) {
        
        if (!currentQuests) {
          addMessage("현재 진행 중인 퀘스트가 없습니다. 먼저 사용자 이름을 입력해주세요!", true);
          setIsProcessing(false);
          return;
        }
        
        // 어떤 퀘스트를 완료했는지 분석
        let completedQuestIndex = -1;
        
        for (let i = 0; i < currentQuests.quests.length; i++) {
          const quest = currentQuests.quests[i];
          const questKeywords = quest.title.toLowerCase().split(' ');
          
          if (questKeywords.some(keyword => userMessage.toLowerCase().includes(keyword)) ||
              userMessage.includes(`${i + 1}`) ||
              (userMessage.includes('첫') && i === 0) ||
              (userMessage.includes('두') && i === 1) ||
              (userMessage.includes('세') && i === 2)) {
            completedQuestIndex = i;
            break;
          }
        }
        
        if (completedQuestIndex >= 0) {
          await handleQuestCompletion(completedQuestIndex, currentQuests.quests[completedQuestIndex].title);
        } else {
          addMessage("어떤 퀘스트를 완료하셨는지 좀 더 구체적으로 알려주세요! 😊\n\n예: '첫 번째 퀘스트 완료' 또는 구체적인 퀘스트 제목 언급", true);
        }
        
      } else if (userMessage.toLowerCase().includes('새') && (userMessage.toLowerCase().includes('퀘스트') || userMessage.toLowerCase().includes('quest'))) {
        
        if (!currentQuests) {
          addMessage("먼저 사용자 이름을 입력해서 퀘스트를 생성해주세요!", true);
        } else {
          await generateNewQuests();
        }
        
      } else if (userMessage.toLowerCase().includes('상태') || userMessage.toLowerCase().includes('진행')) {
        
        // 현재 퀘스트 상태 확인
        if (currentQuests) {
          const completedCount = currentQuests.quests.filter(q => q.completed).length;
          const totalCount = currentQuests.quests.length;
          
          addMessage(`📊 **현재 퀘스트 상태**\n\n👤 사용자: ${currentQuests.userName}\n완료: ${completedCount}/${totalCount}\n진행률: ${Math.round((completedCount / totalCount) * 100)}%\n\n단계: ${stageNames[currentQuests.stage]}`, true);
          
          if (completedCount === totalCount) {
            addMessage("🎉 모든 퀘스트를 완료하셨네요! 정말 대단합니다!\n\n새로운 도전을 원하시면 '새 퀘스트'라고 말씀해주세요!", true);
          }
        } else {
          addMessage("현재 진행 중인 퀘스트가 없습니다. 사용자 이름을 입력해서 퀘스트를 시작해주세요!", true);
        }
        
      } else {
        // 일반적인 대화 - OpenAI 사용
        if (OpenAIService.validateApiKey() && currentQuests) {
          try {
            const aiResponse = await OpenAIService.generateChatResponse(
              userMessage,
              'quest',
              { name: currentQuests.userName }
            );
            addMessage(aiResponse, true);
          } catch (error) {
            // AI 응답 실패 시 기본 응답
            const responses = [
              "퀘스트 관련해서 도움이 필요하시면 언제든 말씀해주세요! 😊",
              "화이팅입니다! 퀘스트 완료하시면 꼭 알려주세요! 🚀",
              "궁금한 것이 있으시면 언제든 물어보세요!",
              "퀘스트 진행 상황이 궁금하시면 '상태 확인'이라고 말씀해주세요!"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse, true);
          }
        } else {
          // OpenAI 없거나 퀘스트가 없을 때
          if (!currentQuests) {
            addMessage("먼저 사용자 이름을 입력해서 퀘스트를 생성해주세요! 😊", true);
          } else {
            const responses = [
              "퀘스트 관련해서 도움이 필요하시면 언제든 말씀해주세요! 😊",
              "화이팅입니다! 퀘스트 완료하시면 꼭 알려주세요! 🚀",
              "궁금한 것이 있으시면 언제든 물어보세요!",
              "퀘스트 진행 상황이 궁금하시면 '상태 확인'이라고 말씀해주세요!"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse, true);
          }
        }
      }
      
    } catch (error) {
      addMessage("처리 중 오류가 발생했습니다. 다시 시도해주세요.", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
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
        <Title>맞춤형 퀘스트</Title>
        <Subtitle>개인별 회복 여정 가이드</Subtitle>
        {currentQuests && (
          <UserInfo>
            👤 {currentQuests.userName}님 | 
            📊 {stageNames[currentQuests.stage]} | 
            🎯 진행률: {currentQuests.quests.filter(q => q.completed).length}/{currentQuests.quests.length}
          </UserInfo>
        )}
        {!currentQuests && (
          <UserInfo>
            🎮 퀘스트 생성 대기 중...
          </UserInfo>
        )}
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
      
      <ActionButtons style={{ padding: '0 20px 10px' }}>
        <ActionButton variant="secondary" onClick={onBack}>
          ← 문진으로 돌아가기
        </ActionButton>
        <ActionButton 
          variant="primary" 
          onClick={generateNewQuests} 
          disabled={isProcessing || !currentQuests}
        >
          🆕 새 퀘스트 생성
        </ActionButton>
      </ActionButtons>
      
      <InputContainer onSubmit={handleSubmit}>
        <TextArea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            !currentQuests 
              ? "사용자 이름을 입력해주세요..." 
              : "퀘스트 완료 보고, 상태 확인, 새 퀘스트 요청 등을 입력해주세요..."
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

export default QuestPage;