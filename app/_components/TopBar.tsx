'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { Rabbit } from './Rabbit';
import { signOut } from '@/app/auth/actions';


export interface CurrentUser {
  username: string;
}

interface Props {
  query?: string;
  onQuery?: (q: string) => void;
  currentUser?: CurrentUser | null;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </svg>
  );
}

export function TopBar({ query, onQuery, currentUser }: Props) {
  const { dark, toggleDark } = useTheme();

  return (
    <header className="topbar">
      <div className="topbar-in">
        <Link href="/" className="wordmark">
          <Rabbit size={22} stroke={2.2} className="rabbit-mark" />
          <span>rabbithole</span>
        </Link>

        {onQuery !== undefined && (
          <label className="search">
            <SearchIcon />
            <input
              value={query ?? ''}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="What are you supposed to be doing right now?"
              aria-label="Search rabbit holes"
            />
          </label>
        )}

        <nav className="nav-actions" style={{ marginLeft: onQuery === undefined ? 'auto' : undefined }}>
          <button className="icon-btn" onClick={toggleDark} title={dark ? 'Light mode' : 'Dark mode'} aria-label="Toggle theme">
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          {currentUser ? (
            <>
              <Link href={`/u/${currentUser.username}`} className="navlink">
                @{currentUser.username}
              </Link>
              <form action={signOut}>
                <button type="submit" className="navlink auth" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 11px' }}>
                  Sign out
                </button>
              </form>
              <Link href="/write" className="btn-write">Write a rabbit hole</Link>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="navlink auth">Sign in</Link>
              <Link href="/auth/sign-up" className="btn-write">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}