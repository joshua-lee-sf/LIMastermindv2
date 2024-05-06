import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

const mastermind2API = createApi({
    reducerPath: 'mastermind2API',
    baseQuery: fetchBaseQuery({baseUrl: '/api'}),
    endpoints: builder => ({
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: '/users/login',
                method: 'POST',
                body: credentials
            })
        })
    })
});

export const {
    useLoginUserMutation,
} = mastermind2API;

export default mastermind2API