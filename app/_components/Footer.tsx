import Link from 'next/link';
import { Rabbit } from './Rabbit';

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-left">
          <p className="foot-tagline">Proof that people still think interesting thoughts.</p>
          <div className="foot-links">
            <Link href="/">Read</Link>
            <Link href="/write">Write</Link>
            <Link href="/membership">Membership</Link>
            <Link href="/book">The book</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
        <Rabbit size={56} stroke={1.8} className="foot-rabbit" />
      </div>
    </footer>
  );
}