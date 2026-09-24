import React, { useState, useEffect } from 'react';
import { NavTab, KnowledgeItem, NoteItem, QuizSession, FlashcardDeck, StudyPlan } from './types';
import { api } from './services/api';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { LandingHero } from './components/landing/LandingHero';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { DocumentManager } from './components/documents/DocumentManager';
import { YouTubeManager } from './components/youtube/YouTubeManager';
import { ChatInterface } from './components/rag-chat/ChatInterface';
import { SummaryStudio } from './components/summaries/SummaryStudio';
import { NotesManager } from './components/notes/NotesManager';
import { QuizArena } from './components/quiz/QuizArena';
import { FlashcardDeck as FlashcardDeckComponent } from './components/flashcards/FlashcardDeck';
import { StudyAssistant } from './components/study/StudyAssistant';
import { KnowledgeLibrary } from './components/library/KnowledgeLibrary';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { FreeTierSettings } from './components/settings/FreeTierSettings';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Core Data State
  const [documents, setDocuments] = useState<KnowledgeItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSession[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Contextual routing parameters
  const [chatTargetDocId, setChatTargetDocId] = useState<string | undefined>(undefined);

  // Initialize theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load all initial state
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [docs, nts, qzs, dcks, plans] = await Promise.all([
        api.getDocuments(),
        api.getNotes(),
        api.getQuizzes(),
        api.getFlashcardDecks(),
        api.getStudyPlans(),
      ]);
      setDocuments(docs);
      setNotes(nts);
      setQuizzes(qzs);
      setFlashcardDecks(dcks);
      setStudyPlans(plans);
    } catch (e) {
      console.error('Failed to load application data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDocumentForChat = (docId: string) => {
    setChatTargetDocId(docId);
    setCurrentTab('chat');
  };

  const handleGenerateQuizForDoc = (docId: string) => {
    setChatTargetDocId(docId);
    setCurrentTab('quiz');
  };

  const handleGenerateNotesForDoc = (docId: string) => {
    setChatTargetDocId(docId);
    setCurrentTab('notes');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSearch={() => setSearchOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectTab={setCurrentTab}
        onSelectDocument={handleSelectDocumentForChat}
      />

      {/* Main Viewport Container */}
      {currentTab === 'landing' ? (
        <LandingHero onSelectTab={setCurrentTab} />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            documentCount={documents.length}
            noteCount={notes.length}
          />

          {/* Tab Content Canvas */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {currentTab === 'dashboard' && (
              <DashboardOverview
                documents={documents}
                notes={notes}
                quizzes={quizzes}
                flashcardDecks={flashcardDecks}
                onSelectTab={setCurrentTab}
                onOpenUpload={() => setCurrentTab('documents')}
                onOpenYouTubeModal={() => setCurrentTab('youtube')}
                onOpenSearch={() => setSearchOpen(true)}
              />
            )}

            {currentTab === 'documents' && (
              <DocumentManager
                documents={documents}
                onRefresh={loadAllData}
                onSelectDocumentForChat={handleSelectDocumentForChat}
              />
            )}

            {currentTab === 'youtube' && (
              <YouTubeManager
                documents={documents}
                onRefresh={loadAllData}
                onSelectForChat={handleSelectDocumentForChat}
                onGenerateQuizForDoc={handleGenerateQuizForDoc}
                onGenerateNotesForDoc={handleGenerateNotesForDoc}
              />
            )}

            {currentTab === 'chat' && (
              <ChatInterface
                documents={documents}
                preselectedDocId={chatTargetDocId}
              />
            )}

            {currentTab === 'summaries' && (
              <SummaryStudio documents={documents} />
            )}

            {currentTab === 'notes' && (
              <NotesManager
                notes={notes}
                documents={documents}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'quiz' && (
              <QuizArena
                quizzes={quizzes}
                documents={documents}
                preselectedDocId={chatTargetDocId}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'flashcards' && (
              <FlashcardDeckComponent
                decks={flashcardDecks}
                documents={documents}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'study' && (
              <StudyAssistant
                studyPlans={studyPlans}
                onRefresh={loadAllData}
              />
            )}

            {currentTab === 'library' && (
              <KnowledgeLibrary
                documents={documents}
                onSelectDocument={handleSelectDocumentForChat}
                onSelectTab={setCurrentTab}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsDashboard
                documents={documents}
                quizzes={quizzes}
                flashcardDecks={flashcardDecks}
                notes={notes}
              />
            )}

            {currentTab === 'free-tier' && <FreeTierSettings />}
          </main>
        </div>
      )}
    </div>
  );
}
