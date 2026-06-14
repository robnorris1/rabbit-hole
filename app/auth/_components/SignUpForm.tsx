'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signUp } from '../actions';

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, null);

  return (
    <form action={formAction} className="auth-form">
      {state?.error && <p className="auth-error">{state.error}</p>}

      <label className="auth-label">
        Username
        <input
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="lowercase, letters and numbers only"
          pattern="[a-z0-9_\-]{3,30}"
          className="auth-input"
        />
      </label>

      <label className="auth-label">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="auth-input"
        />
      </label>

      <label className="auth-label">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="auth-input"
        />
        <span className="auth-hint">8+ characters, at least one number</span>
      </label>

      <button type="submit" disabled={pending} className="auth-btn">
        {pending ? 'Creating account…' : 'Create account'}
      </button>

      <p className="auth-footer">
        Already have an account? <Link href="/auth/sign-in" className="auth-link">Sign in</Link>
      </p>
    </form>
  );
}