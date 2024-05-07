import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    userName: null,
    token: null
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        receiveCurrentUser: (state, action) => ({user: action.payload}),
        logoutUser: () => {
            return initialState
        },
        setUser: (state, action) => {
            return action.payload
        },
    }
});

export const { 
    receiveCurrentUser, 
    logoutUser, 
    setUser, 
    clearUser 
} = sessionSlice.actions;

export default sessionSlice.reducer;