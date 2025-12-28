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

export type BadgeType = 'diamond' | 'gold' | null;

export interface BadgeAssignment {
  diamond: string | null; // quoteId that has the diamond
  gold: string | null;    // quoteId that has the gold
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
  badgeAssignments: BadgeAssignment;

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
  assignBadge: (quoteId: string, badge: BadgeType) => void;
  clearBadge: (badge: 'diamond' | 'gold') => void;
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
  badgeAssignments: { diamond: null, gold: null } as BadgeAssignment,
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

      assignBadge: (quoteId: string, badge: BadgeType) => {
        const state = get();
        const newAssignments = { ...state.badgeAssignments };

        // If clicking the same badge on the same quote, toggle it off
        if (badge === 'diamond' && newAssignments.diamond === quoteId) {
          newAssignments.diamond = null;
        } else if (badge === 'gold' && newAssignments.gold === quoteId) {
          newAssignments.gold = null;
        } else if (badge) {
          // If this quote already has the other badge, remove it
          if (badge === 'diamond' && newAssignments.gold === quoteId) {
            newAssignments.gold = null;
          } else if (badge === 'gold' && newAssignments.diamond === quoteId) {
            newAssignments.diamond = null;
          }
          // Assign the new badge
          newAssignments[badge] = quoteId;
        }

        set({ badgeAssignments: newAssignments });
      },

      clearBadge: (badge: 'diamond' | 'gold') => {
        const state = get();
        set({
          badgeAssignments: {
            ...state.badgeAssignments,
            [badge]: null,
          },
        });
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
        badgeAssignments: state.badgeAssignments,
        issueTitle: state.issueTitle,
        questionText: state.questionText,
        topicId: state.topicId,
      }),
    }
  )
);