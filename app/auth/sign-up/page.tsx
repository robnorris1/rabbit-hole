import type { Metadata } from 'next';
import Link from 'next/link';
import { Rabbit } from '@/app/_components/Rabbit';
import { SignUpForm } from '../_components/SignUpForm';

export const metadata: Metadata = { title: 'Sign up — rabbithole' };

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <Link href="/" className="auth-wordmark">
        <Rabbit size={22} stroke={2.2} />
        <span>rabbithole</span>
      </Link>
      <h1 className="auth-heading">About time.</h1>
      <SignUpForm />
    </div>
  );
}