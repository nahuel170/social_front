import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './reducers';
import { socketMiddleware } from './socketMiddleware';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(socketMiddleware),
});