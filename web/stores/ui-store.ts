"use client";

import { create } from "zustand";

type UiState = {
  cartOpen: boolean;
  searchOpen: boolean;
  quizOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setQuizOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  quizOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setQuizOpen: (quizOpen) => set({ quizOpen }),
}));
