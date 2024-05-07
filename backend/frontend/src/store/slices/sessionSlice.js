import { createSlice } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

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
        }
    }
});

export const { receiveCurrentUser, logoutUser, setUser, clearUser } = sessionSlice.actions;

// Helper methods
const storeCurrentUser = (user) => {
    const data = JSON.stringify(user)
    if (user) sessionStorage.setItem('currentUser', data);
    else sessionStorage.removeItem('currentUser');
}

const storeCSRFToken = (response) => {
    const token = response.headers.get('X-CSRF-Token');
    if(token) sessionStorage.setItem('X-CSRF-Token', token);
}

export default sessionSlice.reducer;