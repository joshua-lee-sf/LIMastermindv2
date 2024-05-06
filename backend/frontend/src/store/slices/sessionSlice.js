import csrfFetch from "./csrf";
import { createSlice } from "@reduxjs/toolkit";
import session from "express-session";
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const initialState = {
    user: undefined
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        receiveCurrentUser: (state, action) => {{user: action.payload}},
        logoutUser: (state) => {
            state.user = null
        },
        loginUser: (state, action) => {state},
        setToken: (state, action) => {
            state.token = action.payload
        },
        clearToken: () => {
            return {token: null}
        }
    }
});

export const { receiveCurrentUser, logoutUser, setToken, clearToken } = sessionSlice.actions;

export const signup = user => startSession(user, 'api/users/register');
export const login = user => startSession(user, 'api/users/login');



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