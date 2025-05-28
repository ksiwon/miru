// App.tsx
import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';
import WelcomePage from './pages/WelcomePage';
import AssessmentPage from './pages/AssessmentPage';
import QuestPage from './pages/QuestPage';
import { UserData } from './types';

type AppState = 'welcome' | 'assessment' | 'quest';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppState>('welcome');

  const handleStartAssessment = () => {
    setCurrentPage('assessment');
  };

  const handleStartQuest = () => {
    setCurrentPage('quest');
  };

  const handleAssessmentComplete = (data: UserData) => {
    setCurrentPage('quest');
  };

  const handleBackToWelcome = () => {
    setCurrentPage('welcome');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'welcome':
        return (
          <WelcomePage 
            onStartAssessment={handleStartAssessment}
            onStartQuest={handleStartQuest}
          />
        );
      case 'assessment':
        return (
          <AssessmentPage onComplete={handleAssessmentComplete} />
        );
      case 'quest':
        return (
          <QuestPage onBack={handleBackToWelcome} />
        );
      default:
        return (
          <WelcomePage 
            onStartAssessment={handleStartAssessment}
            onStartQuest={handleStartQuest}
          />
        );
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {renderCurrentPage()}
    </ThemeProvider>
  );
};

export default App;