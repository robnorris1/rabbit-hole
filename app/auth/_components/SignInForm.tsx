'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signIn } from '../actions';

interface Props {
  prefillEmail?: string;
  confirmed?: boolean;
}

export function SignInForm({ prefillEmail, confirmed }: Props) {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="auth-form">
      {confirmed && (
        <p className="auth-notice">Email confirmed — you can sign in now.</p>
      )}
      {state?.error && <p className="auth-error">{state.error}</p>}

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

      <button type="submit" disabled={pending} className="auth-btn">
        {pending ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="auth-footer">
        No account? <Link href="/auth/sign-up" className="auth-link">Sign up</Link>
      </p>
    </form>
  );
}