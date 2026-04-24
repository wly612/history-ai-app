import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import ChronicleScreen from './components/ChronicleScreen';
import DialogueScreen from './components/DialogueScreen';
import AssessmentScreen from './components/AssessmentScreen';
import ReportScreen from './components/ReportScreen';
import ImmersiveScene from './components/ImmersiveScene';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import { Screen, HistoricalNode, AppState } from './types';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

  const [currentScreen, setCurrentScreen] = useState<Screen>('chronicle');
  const [selectedNode, setSelectedNode] = useState<HistoricalNode | null>(null);
  const [isNpcActive, setIsNpcActive] = useState(false);
  const [focusQuestionId, setFocusQuestionId] = useState<string | undefined>(undefined);
  
  const [appState, setAppState] = useState<AppState>({
    learnedNodes: [],
    incorrectQuestions: [],
    interactedNpcs: [],
    userProfile: {
      name: '',
      avatar: '',
      registrationId: 0
    }
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        handleUpdateProfile(user);
        setIsAuthenticated(true);
      } catch (e) {}
    }
  }, []);

  const handleUpdateProfile = (profile: { name: string; avatar?: string; registrationId?: number; email?: string }) => {
    setAppState(prev => ({
      ...prev,
      userProfile: {
        name: profile.name,
        avatar: profile.avatar || 'https://picsum.photos/seed/user/100/100',
        registrationId: profile.registrationId || 813,
      }
    }));
  };

  const handleAuthSuccess = (user: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    handleUpdateProfile(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const handleNodeSelect = (node: HistoricalNode) => {
    setSelectedNode(node);
  };

  const handleMarkLearned = (nodeId: string) => {
    setAppState(prev => ({
      ...prev,
      learnedNodes: prev.learnedNodes.includes(nodeId) ? prev.learnedNodes : [...prev.learnedNodes, nodeId]
    }));
  };

  const handleAssessmentComplete = (incorrectIds: string[]) => {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setAppState(prev => {
      if (focusQuestionId) {
        const isNowCorrect = incorrectIds.length === 0;
        const newIncorrect = isNowCorrect 
          ? prev.incorrectQuestions.filter(id => id !== focusQuestionId)
          : prev.incorrectQuestions;
        return { ...prev, incorrectQuestions: newIncorrect, lastAssessmentTime: formattedTime };
      }
      return { ...prev, incorrectQuestions: incorrectIds, lastAssessmentTime: formattedTime };
    });
    setCurrentScreen('report');
    setFocusQuestionId(undefined);
  };

  const handleRedoQuestion = (questionId: string) => {
    setFocusQuestionId(questionId);
    setCurrentScreen('assessment');
  };

  const handleNpcInteract = (npcName: string) => {
    setAppState(prev => ({
      ...prev,
      interactedNpcs: prev.interactedNpcs.includes(npcName) ? prev.interactedNpcs : [...prev.interactedNpcs, npcName]
    }));
  };

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen);
    setSelectedNode(null); 
    setFocusQuestionId(undefined);
  };

  if (!isAuthenticated) {
    if (authScreen === 'login') return <LoginScreen onLoginSuccess={handleAuthSuccess} onSwitchToRegister={() => setAuthScreen('register')} />;
    return <RegisterScreen onRegisterSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthScreen('login')} />;
  }

  const renderScreen = () => {
    if (selectedNode && currentScreen === 'chronicle') {
      return (
        <ImmersiveScene 
          key="immersive" 
          node={selectedNode} 
          onBack={() => setSelectedNode(null)} 
          onEnterScene={() => handleMarkLearned(selectedNode.id)}
        />
      );
    }

    switch (currentScreen) {
      case 'chronicle':
        return <ChronicleScreen key="chronicle" onNodeSelect={handleNodeSelect} appState={appState} />;
      case 'dialogue':
        return <DialogueScreen key="dialogue" sceneId={selectedNode ? selectedNode.id : undefined} onNpcInteract={handleNpcInteract} onNpcSelect={setIsNpcActive} />;
      case 'assessment':
        return (
          <AssessmentScreen 
            key="assessment" 
            sceneId={selectedNode ? selectedNode.id : undefined}
            onComplete={handleAssessmentComplete} 
            focusQuestionId={focusQuestionId}
            onBack={focusQuestionId ? () => setCurrentScreen('report') : undefined}
          />
        );
      case 'report':
        return (
          <ReportScreen 
            key="report" 
            appState={appState} 
            onNavigate={handleScreenChange} 
            onRedoQuestion={handleRedoQuestion}
          />
        );
      default:
        return <ChronicleScreen key="chronicle" onNodeSelect={handleNodeSelect} appState={appState} />;
    }
  };

  return (
    <Layout 
      currentScreen={currentScreen} 
      onScreenChange={handleScreenChange} 
      hideNav={!!selectedNode || isNpcActive}
      appState={appState}
      onUpdateProfile={handleUpdateProfile}
    >
      <div className="absolute top-4 right-4 z-[100] cursor-pointer" onClick={handleLogout}>
         <span className="text-xs text-tertiary hover:text-primary transition-colors font-label tracking-widest uppercase">断开链接 (登出)</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedNode ? `immersive-${selectedNode.id}` : currentScreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
