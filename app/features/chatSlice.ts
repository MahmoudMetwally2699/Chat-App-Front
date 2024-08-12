import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendMessage, getMessages, getOrCreateChat } from '../services/chatService';

interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
}

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatId: string) => {
  const response = await getMessages(chatId);
  return response as Message[];
});

export const postMessage = createAsyncThunk('chat/postMessage', async ({ chatId, content }: { chatId: string, content: string }) => {
  const response = await sendMessage(chatId, content);
  return response as Message;
});

export const fetchOrCreateChat = createAsyncThunk('chat/fetchOrCreateChat', async (recipientId: string) => {
  const response = await getOrCreateChat(recipientId);
  return response;
});

interface ChatState {
  messages: Message[];
  chatId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  chatId: null,
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(postMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(postMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      })
      .addCase(fetchOrCreateChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrCreateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chatId = action.payload._id;
      })
      .addCase(fetchOrCreateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      });
  },
});

export const { addMessage } = chatSlice.actions;
export default chatSlice.reducer;
