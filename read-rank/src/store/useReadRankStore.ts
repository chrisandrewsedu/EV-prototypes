import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Quote {
  id: string;
  text: string;
  candidateId?: string;
  issue: string;
}

export interface RankedQuote extends Quote {
  rank: number;
  timestamp: number;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  office: string;
  photo: string;
  alignmentPercent: number;
  issuesAligned: number;
  totalIssues: number;
}

export interface MatchingResult {
  candidateId: string;
  name: string;
  party: string;
  office: string;
  photo: string;
  alignmentPercent: number;
  issuesAligned: number;
  totalIssues: number;
  rankedQuoteMatches: Array<{
    userRank: number;
    quoteId: string;
    points: number;
  }>;
}

export type Phase = 'evaluation' | 'ranking' | 'results';

interface ReadRankState {
  // Current phase
  phase: Phase;
  
  // Evaluation phase
  quotesToEvaluate: Quote[];
  currentQuoteIndex: number;
  agreedQuotes: Quote[];
  disagreedQuotes: Quote[];
  
  // Ranking phase
  rankedQuotes: RankedQuote[];
  
  // Results phase
  candidateMatches: MatchingResult[];
  
  // Session data
  issueTitle: string;
  questionText: string;
  topicId: string;
  
  // Actions
  setPhase: (phase: Phase) => void;
  setQuotes: (quotes: Quote[]) => void;
  nextQuote: () => void;
  agreeWithQuote: (quote: Quote) => void;
  disagreeWithQuote: (quote: Quote) => void;
  rankQuote: (quoteId: string, newRank: number) => void;
  setRankedQuotes: (quotes: Quote[]) => void;
  setCandidateMatches: (matches: MatchingResult[]) => void;
  reset: () => void;
  setIssueInfo: (title: string, question: string, topicId: string) => void;
}

const initialState = {
  phase: 'evaluation' as Phase,
  quotesToEvaluate: [],
  currentQuoteIndex: 0,
  agreedQuotes: [],
  disagreedQuotes: [],
  rankedQuotes: [],
  candidateMatches: [],
  issueTitle: '',
  questionText: '',
  topicId: '',
};

export const useReadRankStore = create<ReadRankState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setPhase: (phase) => set({ phase }),
      
      setQuotes: (quotes) => set({ 
        quotesToEvaluate: quotes,
        currentQuoteIndex: 0,
        agreedQuotes: [],
        disagreedQuotes: [],
      }),
      
      nextQuote: () => {
        const state = get();
        const nextIndex = state.currentQuoteIndex + 1;
        if (nextIndex >= state.quotesToEvaluate.length) {
          // Move directly to ranking phase (skip collection)
          set({ phase: 'ranking' });
        } else {
          set({ currentQuoteIndex: nextIndex });
        }
      },
      
      agreeWithQuote: (quote) => {
        const state = get();
        const updatedAgreedQuotes = [...state.agreedQuotes, quote];
        set({ 
          agreedQuotes: updatedAgreedQuotes,
        });
        get().nextQuote();
      },
      
      disagreeWithQuote: (quote) => {
        const state = get();
        const updatedDisagreedQuotes = [...state.disagreedQuotes, quote];
        set({ 
          disagreedQuotes: updatedDisagreedQuotes,
        });
        get().nextQuote();
      },
      
      rankQuote: (quoteId, newRank) => {
        const state = get();
        const quoteToRank = state.agreedQuotes.find(q => q.id === quoteId);
        if (!quoteToRank) return;
        
        // Remove from current position if it exists
        const filteredRankedQuotes = state.rankedQuotes.filter(q => q.id !== quoteId);
        
        // Add with new rank
        const rankedQuote: RankedQuote = {
          ...quoteToRank,
          rank: newRank,
          timestamp: Date.now(),
        };
        
        // Insert at correct position and re-rank
        const newRankedQuotes = [...filteredRankedQuotes, rankedQuote]
          .sort((a, b) => a.rank - b.rank)
          .map((quote, index) => ({ ...quote, rank: index + 1 }));
        
        set({ rankedQuotes: newRankedQuotes });
      },
      
      setRankedQuotes: (quotes: Quote[]) => {
        const rankedQuotes: RankedQuote[] = quotes.map((quote, index) => ({
          ...quote,
          rank: index + 1,
          timestamp: Date.now(),
        }));
        set({ rankedQuotes });
      },
      
      setCandidateMatches: (matches) => set({ candidateMatches: matches }),
      
      setIssueInfo: (title, question, topicId) => set({ 
        issueTitle: title, 
        questionText: question, 
        topicId 
      }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'readrank-storage',
      partialize: (state) => ({
        phase: state.phase,
        agreedQuotes: state.agreedQuotes,
        rankedQuotes: state.rankedQuotes,
        issueTitle: state.issueTitle,
        questionText: state.questionText,
        topicId: state.topicId,
      }),
    }
  )
);