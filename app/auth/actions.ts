'use server';

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  NotAuthorizedException,
  UsernameExistsException,
  CodeMismatchException,
  ExpiredCodeException,
} from '@aws-sdk/client-cognito-identity-provider';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createUser, getUserByUsername } from '@/db/queries/users';

const cognito = new CognitoIdentityProviderClient({ region: 'eu-west-2' });
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

const TOKEN_MAX_AGE = 60 * 60 * 24; // 24h

export type AuthState = { error: string } | null;

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string).trim().toLowerCase();
  const password = formData.get('password') as string;

  let idToken: string;
  try {
    const result = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: { USERNAME: email, PASSWORD: password },
      }),
    );
    idToken = result.AuthenticationResult?.IdToken ?? '';
    if (!idToken) return { error: 'Authentication failed. Please try again.' };
  } catch (err) {
    if (err instanceof NotAuthorizedException) return { error: 'Incorrect email or password.' };
    return { error: 'Something went wrong. Please try again.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('rh-token', idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_MAX_AGE,
  });

  redirect('/');
}

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const username = (formData.get('username') as string).trim().toLowerCase();
  const email = (formData.get('email') as string).trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
    return { error: 'Username must be 3–30 characters: letters, numbers, hyphens, underscores.' };
  }

  const existing = await getUserByUsername(username);
  if (existing) return { error: 'That username is taken.' };

  let cognitoSub: string;
  try {
    const result = await cognito.send(
      new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }],
      }),
    );
    cognitoSub = result.UserSub!;
  } catch (err) {
    if (err instanceof UsernameExistsException)
      return { error: 'An account with that email already exists.' };
    return { error: 'Could not create account. Please try again.' };
  }

  await createUser({ cognitoSub, username, email });

  redirect(`/auth/confirm?email=${encodeURIComponent(email)}`);
}

export async function confirmSignUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string).trim().toLowerCase();
  const code = (formData.get('code') as string).trim();

  try {
    await cognito.send(
      new ConfirmSignUpCommand({ ClientId: CLIENT_ID, Username: email, ConfirmationCode: code }),
    );
  } catch (err) {
    if (err instanceof CodeMismatchException) return { error: 'Incorrect code. Please try again.' };
    if (err instanceof ExpiredCodeException)
      return { error: 'Code expired. Please sign up again.' };
    return { error: 'Confirmation failed. Please try again.' };
  }

  redirect(`/auth/sign-in?confirmed=1&email=${encodeURIComponent(email)}`);
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('rh-token');
  redirect('/');
}