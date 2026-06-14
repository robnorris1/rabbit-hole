'use client';

import { useActionState } from 'react';
import { confirmSignUp } from '../actions';

interface Props {
  email: string;
}

export function ConfirmForm({ email }: Props) {
  const [state, formAction, pending] = useActionState(confirmSignUp, null);

  return (
    <form action={formAction} className="auth-form">
      <p className="auth-notice">
        We sent a 6-digit code to <strong>{email}</strong>. Check your inbox.
      </p>

      {state?.error && <p className="auth-error">{state.error}</p>}

      <input type="hidden" name="email" value={email} />

      <label className="auth-label">
        Confirmation code
        <input
          name="code"
          type="text"
          required
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="123456"
          autoComplete="one-time-code"
          className="auth-input auth-input-code"
          autoFocus
        />
      </label>

      <button type="submit" disabled={pending} className="auth-btn">
        {pending ? 'Confirming…' : 'Confirm email'}
      </button>
    </form>
  );
}