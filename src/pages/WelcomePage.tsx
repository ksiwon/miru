// pages/WelcomePage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Message } from '../types';
import { generateMessageId, delay } from '../utils';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.purple[300]} 100%);
`;

const Header = styled.header`
  padding: 40px 20px;
  text-align: center;
  color: ${props => props.theme.colors.white};
`;

const Title = styled.h1`
  ${props => props.theme.typography.T1}
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  ${props => props.theme.typography.T5}
  opacity: 0.9;
  margin-bottom: 32px;
`;

const WelcomeIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.white};
  border-radius: 24px 24px 0 0;
  padding: 24px;
  margin: 0 16px;
  overflow-y: auto;
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
  background: ${props => props.isBot ? props.theme.colors.gray[100] : props.theme.colors.primary};
  color: ${props => props.isBot ? props.theme.colors.black : props.theme.colors.white};
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
    border-top-color: ${props => props.isBot ? props.theme.colors.gray[100] : props.theme.colors.primary};
    border-bottom: 0;
    transform: ${props => props.isBot ? 'rotate(-45deg)' : 'rotate(45deg)'};
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 16px 24px;
  border-radius: 16px;
  ${props => props.theme.typography.T5}
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.gray[300]};
  background: ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.white};
  color: ${props => props.variant === 'primary' ? props.theme.colors.white : props.theme.colors.gray[600]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    ${props => props.variant === 'primary' ? 
      `background: ${props.theme.colors.purple[300]};` : 
      `background: ${props.theme.colors.gray[100]};`
    }
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.theme.colors.primary};
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

interface WelcomePageProps {
  onStartAssessment: () => void;
  onStartQuest: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStartAssessment, onStartQuest }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showButtons, setShowButtons] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isBot: boolean = false) => {
    const newMessage: Message = {
      id: generateMessageId(),
      text,
      isBot,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const initializeWelcome = useCallback(async () => {
    setIsProcessing(true);
    
    await delay(1000);
    addMessage("안녕하세요! 👋", true);
    
    await delay(1500);
    addMessage("저는 히키코모리 회복 지원 앱의 AI 어시스턴트입니다! 😊", true);
    
    await delay(2000);
    addMessage("먼저 간단한 질문이 있습니다.\n\n이전에 문진(개인 상담)을 진행하신 적이 있으신가요?", true);
    
    await delay(1000);
    setShowButtons(true);
    setIsProcessing(false);
  }, []);

  useEffect(() => {
    initializeWelcome();
  }, [initializeWelcome]);

  const handleAssessmentChoice = async (hasAssessment: boolean) => {
    setShowButtons(false);
    setIsProcessing(true);
    
    if (hasAssessment) {
      addMessage("네, 문진을 받았어요!", false);
      
      await delay(1000);
      addMessage("훌륭합니다! 🎉\n\n그럼 바로 맞춤형 퀘스트 생성으로 이동할게요!", true);
      
      await delay(1500);
      addMessage("퀘스트 모드에서는 회복 여정을 위한 개인 맞춤형 미션들을 제공해드립니다! 🎮", true);
      
      await delay(2000);
      onStartQuest();
      
    } else {
      addMessage("아니요, 아직 안 받았어요.", false);
      
      await delay(1000);
      addMessage("괜찮습니다! 😊\n\n먼저 문진을 통해 회복 여정에 필요한 정보를 수집해보겠습니다.", true);
      
      await delay(1500);
      addMessage("문진은 총 7개 분야, 27개 질문으로 구성되어 있으며,\n편안한 대화 형식으로 진행됩니다. ✨", true);
      
      await delay(2000);
      addMessage("준비되셨으면 문진을 시작해보겠습니다! 📋", true);
      
      await delay(1500);
      onStartAssessment();
    }
  };

  return (
    <PageContainer>
      <Header>
        <WelcomeIcon>🌟</WelcomeIcon>
        <Title>히키코모리 회복 지원</Title>
        <Subtitle>함께하는 회복 여정의 시작</Subtitle>
      </Header>
      
      <ChatContainer>
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
        
        {showButtons && !isProcessing && (
          <ActionButtonsContainer>
            <ActionButton 
              variant="primary"
              onClick={() => handleAssessmentChoice(true)}
            >
              ✅ 네, 문진을 받았어요!
            </ActionButton>
            <ActionButton 
              variant="secondary"
              onClick={() => handleAssessmentChoice(false)}
            >
              📋 아니요, 문진부터 시작할게요
            </ActionButton>
          </ActionButtonsContainer>
        )}
        
        <div ref={messagesEndRef} />
      </ChatContainer>
    </PageContainer>
  );
};

export default WelcomePage;