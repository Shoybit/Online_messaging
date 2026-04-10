import { create } from "zustand";

type Message = {
  id: number;
  timestamp: import("react/jsx-runtime").JSX.Element;
  text: string;
};

type ChatStore = {
  messages: Message[];
  addMessage: (msg: Message) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),
}));