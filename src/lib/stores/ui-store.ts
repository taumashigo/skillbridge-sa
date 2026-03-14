import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  dataMode: "standard" | "reduced";
  language: "en" | "zu" | "af";
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setDataMode: (mode: "standard" | "reduced") => void;
  setLanguage: (lang: "en" | "zu" | "af") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  dataMode: "standard",
  language: "en",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setDataMode: (mode) => set({ dataMode: mode }),
  setLanguage: (lang) => set({ language: lang }),
}));
