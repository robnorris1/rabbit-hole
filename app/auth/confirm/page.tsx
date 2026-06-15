import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Rabbit } from '@/app/_components/Rabbit';
import { ConfirmForm } from '../_components/ConfirmForm';

export const metadata: Metadata = { title: 'Confirm email — rabbithole' };

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function ConfirmPage({ searchParams }: Props) {
  const { email } = await searchParams;
  if (!email) redirect('/auth/sign-up');

  return (
    <div className="auth-page">
      <Link href="/" className="auth-wordmark">
        <Rabbit size={22} stroke={2.2} />
        <span>rabbithole</span>
      </Link>
      <h1 className="auth-heading">It&apos;s in there somewhere.</h1>
      <ConfirmForm email={email} />
    </div>
  );
}