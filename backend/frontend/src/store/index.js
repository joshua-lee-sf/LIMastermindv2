import { configureStore } from '@reduxjs/toolkit';
import mastermind2API from './loginRTKQuery';
import sessionReducer from './slices/sessionSlice';

export default configureStore({
    reducer: {
        [mastermind2API.reducerPath]: mastermind2API.reducer,
        session: sessionReducer, 
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(mastermind2API.middleware)
});