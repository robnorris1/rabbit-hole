'use server';

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  GlobalSignOutCommand,
  UsernameExistsException,
  CodeMismatchException,
  ExpiredCodeException,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createUser, getUserByEmail, getUserByUsername } from '@/db/queries/users';
import { sendWelcomeEmail } from '@/app/_lib/email';

const cognito = new CognitoIdentityProviderClient({ region: 'eu-west-2' });
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;

const TOKEN_MAX_AGE = 60 * 60 * 24; // 24h

let _verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!_verifier) {
    _verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      tokenUse: 'id',
      clientId: CLIENT_ID,
    });
  }
  return _verifier;
}

export type AuthState = { error: string } | null;

// Called client-side after SRP auth succeeds — validates tokens then stores in HTTP-only cookies
export async function setSessionCookie(
  idToken: string,
  accessToken: string,
): Promise<{ error?: string }> {
  try {
    await getVerifier().verify(idToken);
  } catch {
    return { error: 'Invalid session. Please try again.' };
  }

  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TOKEN_MAX_AGE,
  };
  cookieStore.set('rh-token', idToken, opts);
  cookieStore.set('rh-access', accessToken, opts);

  return {};
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
    console.error('SignUp error:', err);
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

  // Fire-and-forget — don't block the redirect on email delivery
  getUserByEmail(email)
    .then((user) => user && sendWelcomeEmail(email, user.username))
    .catch(console.error);

  redirect(`/auth/sign-in?confirmed=1&email=${encodeURIComponent(email)}`);
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('rh-access')?.value;

  if (accessToken) {
    try {
      await cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken }));
    } catch {
      // Proceed with local sign-out even if revocation fails
    }
  }

  cookieStore.delete('rh-token');
  cookieStore.delete('rh-access');
  redirect('/');
}