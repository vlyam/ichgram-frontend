import { createSlice } from '@reduxjs/toolkit';

// Состояние и операции с диалогами
const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [], // [{ conversationId, hasUnread, ... }]
  },
  reducers: {
    // Установка списка диалогов
    setConversations(state, action) {
      state.conversations = action.payload;
    },

    // Обновление одного диалога
    updateConversation(state, action) {
      const updatedConv = action.payload;
      const idx = state.conversations.findIndex(c => c.conversationId === updatedConv.conversationId);
      if (idx > -1) {
        state.conversations[idx] = updatedConv;
      } else {
        state.conversations.unshift(updatedConv);
      }
    },

    // Сброс непрочитанного статуса у конкретного диалога
    clearUnread(state, action) {
      const conversationId = action.payload;
      const conv = state.conversations.find(c => c.conversationId === conversationId);
      if (conv) {
        conv.hasUnread = false;
      }
    },

    // Удаление диалога
    removeConversation(state, action) {
      state.conversations = state.conversations.filter(
        c => c.conversationId !== action.payload
      );
    },

    // Сброс непрочитанных у всех диалогов
    clearAllUnread(state) {
      state.conversations.forEach(c => {
        c.hasUnread = false;
      });
    },
  },
});

export const {
  setConversations,
  updateConversation,
  clearUnread,
  removeConversation,
  clearAllUnread,
} = messagesSlice.actions;

// Подсчет непрочитанных диалогов
export const selectMessagesUnreadCount = (state) =>
  state.messages.conversations.filter(c => c.hasUnread).length;

export default messagesSlice.reducer;