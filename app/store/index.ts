import { configureStore } from '@reduxjs/toolkit';
import userReducer, { loadUserData } from '../features/userSlice';
import chatReducer from '../features/chatSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
  },
});

store.dispatch(loadUserData());

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
