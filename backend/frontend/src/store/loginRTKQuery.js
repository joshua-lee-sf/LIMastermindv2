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
    endpoints: builder => ({
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: '/users/login',
                method: 'POST',
                body: credentials
            })
        }),
        restoreUser: builder.mutation({
            query: () => ({
                url: '/users/restoreuser',
                method: 'POST'
            })
        })
    })
});

export const {
    useLoginUserMutation,
    useRestoreUserMutation
} = mastermind2API;

export default mastermind2API