import { createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { handleRequest } from './mockServer';
import type {
  ApiErrorShape,
  AuthResponse,
  LoginBody,
  NewSession,
  RegisterBody,
  Session,
  User,
} from '../types';

export interface ApiArgs {
  url: string;
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
}

/**
 * Single transport for the whole app. It currently talks to the in-app mock
 * server. To use a real backend, replace the `handleRequest` call with a
 * `fetch(API_BASE_URL + args.url, { headers: { Authorization: `Bearer ${token}` } ... })`
 * and map the response to `{ data }` / `{ error: { status, data: { message } } }`.
 */
const baseQuery: BaseQueryFn<ApiArgs, unknown, ApiErrorShape> = async (args, api) => {
  const token = (api.getState() as { auth: { token: string | null } }).auth.token;
  const result = await handleRequest({ ...args, token });

  if ('error' in result) {
    // Token rejected while we thought we were logged in -> force logout.
    if (result.error.status === 401 && token) {
      api.dispatch({ type: 'auth/sessionExpired' });
    }
    return { error: result.error };
  }
  return { data: result.data };
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Profile', 'Sessions'],
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginBody>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: build.mutation<AuthResponse, RegisterBody>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    forgotPassword: build.mutation<{ message: string }, { identifier: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    getProfile: build.query<User, void>({
      query: () => ({ url: '/me' }),
      providesTags: ['Profile'],
    }),
    updateProfile: build.mutation<User, { name: string; tagline: string }>({
      query: (body) => ({ url: '/me', method: 'PUT', body }),
      invalidatesTags: ['Profile'],
    }),
    getSessions: build.query<Session[], void>({
      query: () => ({ url: '/sessions' }),
      providesTags: ['Sessions'],
    }),
    addSession: build.mutation<Session, NewSession>({
      query: (body) => ({ url: '/sessions', method: 'POST', body }),
      invalidatesTags: ['Sessions'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetSessionsQuery,
  useAddSessionMutation,
} = api;
