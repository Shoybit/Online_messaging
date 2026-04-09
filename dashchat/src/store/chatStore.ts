import { create } from "zustand";

type Message = {
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