import { create } from 'zustand';
import { AnalysisResult } from '../types/analysis';
import { ResourceType } from '../types/network';

export type FilterCategory = ResourceType | 'all' | 'failed' | 'third-party';

export interface AnalysisState {
  url: string;
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  stage: 'launching' | 'loading' | 'capturing' | 'analyzing' | 'complete';
  stageMessage: string;
  error: string | null;
  result: AnalysisResult | null;
  selectedRequestId: string | null;
  filterType: FilterCategory;
  searchQuery: string;
  sortBy: 'name' | 'size' | 'duration' | 'status';
  sortOrder: 'asc' | 'desc';

  // Actions
  setUrl: (url: string) => void;
  startAnalysis: (inputUrl: string) => Promise<void>;
  setSelectedRequestId: (id: string | null) => void;
  setFilterType: (filter: FilterCategory) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: 'name' | 'size' | 'duration' | 'status') => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  url: '',
  status: 'idle',
  stage: 'launching',
  stageMessage: '',
  error: null,
  result: null,
  selectedRequestId: null,
  filterType: 'all',
  searchQuery: '',
  sortBy: 'duration',
  sortOrder: 'desc',

  setUrl: (url) => set({ url }),

  setSelectedRequestId: (selectedRequestId) => set({ selectedRequestId }),
  setFilterType: (filterType) => set({ filterType }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setSorting: (sortBy) =>
    set((state) => ({
      sortBy,
      sortOrder: state.sortBy === sortBy && state.sortOrder === 'desc' ? 'asc' : 'desc',
    })),

  reset: () =>
    set({
      status: 'idle',
      stage: 'launching',
      stageMessage: '',
      error: null,
      result: null,
      selectedRequestId: null,
      filterType: 'all',
      searchQuery: '',
    }),

  startAnalysis: async (inputUrl: string) => {
    set({
      url: inputUrl,
      status: 'analyzing',
      stage: 'launching',
      stageMessage: 'Launching Chromium Browser...',
      error: null,
      result: null,
      selectedRequestId: null,
    });

    // Simulate meaningful progress stages for UX transparency
    const timer1 = setTimeout(() => {
      set((s) => (s.status === 'analyzing' ? { stage: 'loading', stageMessage: `Loading page content...` } : s));
    }, 1200);

    const timer2 = setTimeout(() => {
      set((s) => (s.status === 'analyzing' ? { stage: 'capturing', stageMessage: `Capturing network events & timings...` } : s));
    }, 4500);

    const timer3 = setTimeout(() => {
      set((s) => (s.status === 'analyzing' ? { stage: 'analyzing', stageMessage: `Evaluating performance rules...` } : s));
    }, 12000);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const data = await res.json();

      if (!res.ok || !data.success) {
        set({
          status: 'error',
          error: data.error || 'Failed to complete website analysis.',
        });
        return;
      }

      set({
        status: 'complete',
        stage: 'complete',
        stageMessage: 'Analysis complete',
        result: data.result,
      });
    } catch {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      set({
        status: 'error',
        error: 'Network error communicating with analysis backend service.',
      });
    }
  },
}));
