import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

const mastermind2API = createApi({
    reducerPath: 'mastermind2API',
    baseQuery: fetchBaseQuery({baseUrl: '/api', 
    prepareHeaders: (headers) => {
        const token = Cookies.get('jwt');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }
        return headers
    },
    }),
    tagTypes: ['Game', 'User'],
    endpoints: builder => ({
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: '/users/login',
                method: 'POST',
                body: credentials
            }),
            invalidatesTags: ['User']
        }),
        restoreUser: builder.query({
            query: () => ({
                url: '/users/restoreuser',
                method: 'GET'
            }),
            providesTags: ['User']
        }),
        createUser: builder.mutation({
            query: (credentials) => ({
                url: '/users/register',
                method: 'POST',
                body: credentials
            }),
            invalidatesTags: ['User']
        }),
        createNewGame: builder.mutation({
            query: (body) => ({
                url: '/games/newgame',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Game']
        }),
        restoreGame: builder.query({
            query: () => ({
                url:'/games/getcurrentgame',
                method: 'GET'
            }),
            providesTags: ['Game']
        }),
        sendGuess: builder.mutation({
            query: (body) => ({
                url: '/games/checkguess',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Game']
        }),
        getHint: builder.query({
            query: (body) => ({
                url: '/games/gethint',
                method: 'GET'
            })
        }),
        endGameEarly: builder.mutation({
            query: (body) => ({
                url: '/games/endgameearly',
                method: 'POST'
            }),
            invalidatesTags: ['Game']
        }),
    })
});

export const {
    useLoginUserMutation,
    useRestoreUserQuery,
    useRestoreGameQuery,
    useCreateUserMutation,
    useCreateNewGameMutation,
    useSendGuessMutation,
    useGetHintQuery,
    useEndGameEarlyMutation,
} = mastermind2API;

export default mastermind2API