import { create } from "zustand";
import { AnalysisResult } from "../types/analysis";
import { ResourceType } from "../types/network";
import { HISTORY_KEY, MAX_REPORTS, portableReport } from "../lib/reports";

export type FilterCategory = ResourceType | "all" | "failed" | "third-party";
const cleanView = {
  selectedRequestId: null,
  filterType: "all" as FilterCategory,
  searchQuery: "",
  sortBy: "duration" as const,
  sortOrder: "desc" as const,
};
let activeController: AbortController | null = null;

export interface AnalysisState {
  url: string;
  status: "idle" | "analyzing" | "complete" | "error";
  error: string | null;
  result: AnalysisResult | null;
  history: AnalysisResult[];
  storageNotice: string | null;
  selectedRequestId: string | null;
  filterType: FilterCategory;
  searchQuery: string;
  sortBy: "name" | "size" | "duration" | "status";
  sortOrder: "asc" | "desc";
  setUrl: (url: string) => void;
  startAnalysis: (url: string) => Promise<void>;
  setSelectedRequestId: (id: string | null) => void;
  setFilterType: (filter: FilterCategory) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (sort: AnalysisState["sortBy"]) => void;
  reset: () => void;
  loadHistory: () => void;
  openReport: (report: AnalysisResult) => void;
  clearHistory: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  url: "",
  status: "idle",
  error: null,
  result: null,
  history: [],
  storageNotice: null,
  ...cleanView,
  setUrl: (url) => set({ url }),
  setSelectedRequestId: (selectedRequestId) => set({ selectedRequestId }),
  setFilterType: (filterType) => set({ filterType }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSorting: (sortBy) =>
    set((state) => ({
      sortBy,
      sortOrder:
        state.sortBy === sortBy && state.sortOrder === "desc" ? "asc" : "desc",
    })),
  reset: () => {
    activeController?.abort();
    activeController = null;
    set({ status: "idle", error: null, result: null, ...cleanView });
  },
  loadHistory: () => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      // Corrupt or old storage should never prevent a new analysis.
      const history = Array.isArray(stored)
        ? stored
            .filter(
              (r) =>
                r &&
                typeof r.url === "string" &&
                typeof r.timestamp === "string" &&
                r.summary &&
                Array.isArray(r.requests) &&
                Array.isArray(r.issues) &&
                r.resources &&
                r.timing,
            )
            .slice(0, MAX_REPORTS)
        : [];
      set({ history });
    } catch {
      set({
        history: [],
        storageNotice: "Saved reports are unavailable in this browser.",
      });
    }
  },
  openReport: (result) => {
    activeController?.abort();
    activeController = null;
    set({
      result,
      url: result.url,
      status: "complete",
      error: null,
      ...cleanView,
    });
  },
  clearHistory: () => {
    try {
      localStorage.removeItem(HISTORY_KEY);
      set({ history: [], storageNotice: null });
    } catch {
      set({ storageNotice: "This browser could not clear saved reports." });
    }
  },
  startAnalysis: async (url) => {
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    const timeout = setTimeout(
      () => controller.abort(new Error("Analysis timed out. Try again.")),
      55000,
    );
    set({ url, status: "analyzing", error: null, result: null, ...cleanView });
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      if (activeController !== controller) return;
      const data = await response.json().catch(() => {
        throw new Error(
          "The server returned an unreadable response. Try again.",
        );
      });
      if (activeController !== controller) return;
      if (!response.ok || !data.success || !data.result)
        throw new Error(data.error || "Unable to complete analysis.");
      const result: AnalysisResult = data.result;
      const history = [portableReport(result), ...get().history].slice(
        0,
        MAX_REPORTS,
      );
      let storageNotice = null;
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch {
        storageNotice =
          "Report ready. Browser storage is full or unavailable; this report is kept for this session only.";
      }
      set({ result, history, storageNotice, status: "complete" });
    } catch (error) {
      if (activeController !== controller) return;
      set({
        status: "error",
        error: controller.signal.aborted
          ? "Analysis timed out. Try again or choose another website."
          : error instanceof Error
            ? error.message
            : "Connection failed. Please try again.",
      });
    } finally {
      clearTimeout(timeout);
      if (activeController === controller) activeController = null;
    }
  },
}));
