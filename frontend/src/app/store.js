import { configureStore } from '@reduxjs/toolkit';
import pollReducer from '../features/pollSlice';

export const store = configureStore({
  reducer: {
    poll: pollReducer,
  },
});