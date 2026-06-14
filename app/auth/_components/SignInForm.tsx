'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CognitoUser,
  CognitoUserPool,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';
import { setSessionCookie } from '../actions';

const userPool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
});

interface Props {
  prefillEmail?: string;
  confirmed?: boolean;
}

export function SignInForm({ prefillEmail, confirmed }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim().toLowerCase();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    setError(null);

    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess(result) {
        const idToken = result.getIdToken().getJwtToken();
        const accessToken = result.getAccessToken().getJwtToken();
        startTransition(async () => {
          const res = await setSessionCookie(idToken, accessToken);
          if (res?.error) {
            setError(res.error);
          } else {
            router.push('/');
          }
        });
      },
      onFailure(err) {
        if (err.code === 'NotAuthorizedException') {
          setError('Incorrect email or password.');
        } else if (err.code === 'UserNotConfirmedException') {
          router.push(`/auth/confirm?email=${encodeURIComponent(email)}`);
        } else {
          setError('Something went wrong. Please try again.');
        }
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {confirmed && (
        <p className="auth-notice">Email confirmed — you can sign in now.</p>
      )}
      {error && <p className="auth-error">{error}</p>}

      <label className="auth-label">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={prefillEmail}
          className="auth-input"
        />
      </label>

      <label className="auth-label">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="auth-input"
        />
      </label>

      <button type="submit" disabled={isPending} className="auth-btn">
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="auth-footer">
        No account? <Link href="/auth/sign-up" className="auth-link">Sign up</Link>
      </p>
    </form>
  );
}