import { useEffect } from 'react';
import { useReadRankStore } from './store/useReadRankStore';
import { mockQuotes, mockIssueData } from './data/mockData';
import { shuffleArray } from './utils/matchingAlgorithm';
import { PhaseContainer } from './components/PhaseContainer';
import { ProgressHeader } from './components/ProgressHeader';
import { DevHelper } from './components/DevHelper';

function App() {
  const { 
    setQuotes, 
    setIssueInfo
  } = useReadRankStore();

  // Initialize the app with mock data
  useEffect(() => {
    // Shuffle quotes to randomize the order
    const shuffledQuotes = shuffleArray(mockQuotes);
    setQuotes(shuffledQuotes);
    setIssueInfo(mockIssueData.title, mockIssueData.question, mockIssueData.topicId);
  }, [setQuotes, setIssueInfo]);

  return (
    <div className="min-h-screen bg-ev-white">
      <DevHelper />
      <ProgressHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <PhaseContainer />
      </main>
    </div>
  );
}

export default App;
