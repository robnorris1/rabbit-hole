import Link from 'next/link';
import type { DeepItem } from '@/db/queries/holes';
import { Rabbit } from './Rabbit';

function ProBook() {
  return (
    <div className="side-block">
      <div className="side-head">
        <h3>Membership</h3>
        <span className="mono">Pro</span>
      </div>
      <div className="probook">
        <div className="book-stage">
          <div className="book">
            <div className="book-spine" />
            <div className="book-cover">
              <div className="b-issue">Vol. 01 · Founding</div>
              <Rabbit size={30} stroke={2.4} className="b-rabbit" />
              <div className="b-title">The best rabbit holes, on paper.</div>
              <div className="b-foot">rabbithole · quarterly</div>
            </div>
          </div>
        </div>
        <p className="pro-copy">
          Top-voted holes go in the book. Printed quarterly, proper type, shipped worldwide.
          <em> The internet decides if yours makes the cut.</em>
        </p>
        <p className="pro-copy">
          <em>We&apos;re writing the thing first. Membership launches once there&apos;s enough worth paying for.</em>
        </p>
        <div className="pro-soon">
          <span className="pro-soon-badge">Coming soon</span>
          <span className="pro-note">£9/mo · ships worldwide · cancel anytime</span>
        </div>
      </div>
    </div>
  );
}

function DeepNow({ items }: { items: DeepItem[] }) {
  return (
    <div className="side-block">
      <div className="side-head">
        <h3>Going deep now</h3>
        <span className="mono">Live</span>
      </div>
      <div className="deep-list">
        {items.map((item, i) => (
          <Link href={`/holes/${item.slug}`} className="deep-item" key={item.slug}>
            <span className="deep-rank">{String(i + 1).padStart(2, '0')}</span>
            <div className="deep-body">
              <span className="deep-title">{item.title}</span>
              <span className="deep-meta">@{item.authorUsername} · {item.readTimeMins} min</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Manifesto() {
  return (
    <div className="side-block span">
      <div className="manifesto">
        <p className="lead">A few things rabbithole is not:</p>
        <p className="strike">&ldquo;Welcome to Rabbithole! 🎉&rdquo;</p>
        <p className="strike">&ldquo;A community for curious minds.&rdquo;</p>
        <p className="strike">Anything with the word &ldquo;journey&rdquo; in it.</p>
        <p>It&apos;s a format. What sparked it, what you found, why it stuck. That&apos;s the whole editorial standard.</p>
        <p>&ldquo;I&apos;ve been thinking a lot about this lately&rdquo; is not a spark. Just the hole.</p>
      </div>
    </div>
  );
}

export function Sidebar({ deep }: { deep: DeepItem[] }) {
  return (
    <aside className="sidebar">
      <ProBook />
      <DeepNow items={deep} />
      <Manifesto />
    </aside>
  );
}