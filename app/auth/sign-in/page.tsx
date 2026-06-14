import type { Metadata } from 'next';
import Link from 'next/link';
import { Rabbit } from '@/app/_components/Rabbit';
import { SignInForm } from '../_components/SignInForm';

export const metadata: Metadata = { title: 'Sign in — rabbithole' };

interface Props {
  searchParams: Promise<{ email?: string; confirmed?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { email, confirmed } = await searchParams;

  return (
    <div className="auth-page">
      <Link href="/" className="auth-wordmark">
        <Rabbit size={22} stroke={2.2} />
        <span>rabbithole</span>
      </Link>
      <h1 className="auth-heading">Sign in</h1>
      <SignInForm prefillEmail={email} confirmed={confirmed === '1'} />
    </div>
  );
}