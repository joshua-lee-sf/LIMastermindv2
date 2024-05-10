import { configureStore } from '@reduxjs/toolkit';
import mastermind2API from './loginRTKQuery';
// import sessionReducer from './slices/sessionSlice';
// import gameReducer from './slices/gameSlice';

export default configureStore({
    reducer: {
        [mastermind2API.reducerPath]: mastermind2API.reducer,
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(mastermind2API.middleware)
});