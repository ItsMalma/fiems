import { create } from "zustand";

interface MenuState {
  key: string;
  setKey: (by: string) => void;
}

export const useMenu = create<MenuState>()((set) => ({
  key: "",
  setKey: (by) => set({ key: by }),
}));
