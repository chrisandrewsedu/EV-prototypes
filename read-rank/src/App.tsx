import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PhaseContainer } from './components/PhaseContainer';
import { ProgressHeader } from './components/ProgressHeader';
import { DevHelper } from './components/DevHelper';
import { CandidateAlignmentPage } from './components/CandidateAlignmentPage';

function MainApp() {
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

function App() {
  return (
    <BrowserRouter basename="/read-rank/dist">
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/candidate/:candidateId/alignment" element={<CandidateAlignmentPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
