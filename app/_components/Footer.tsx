import { Rabbit } from './Rabbit';

export function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-left">
          <p className="foot-tagline">Proof that people still think interesting thoughts.</p>
          <div className="foot-links">
            <a href="/">Read</a>
            <a href="/write">Write</a>
            <a href="/membership">Membership</a>
            <a href="/book">The book</a>
            <a href="/about">About</a>
          </div>
        </div>
        <Rabbit size={56} stroke={1.8} className="foot-rabbit" />
      </div>
    </footer>
  );
}