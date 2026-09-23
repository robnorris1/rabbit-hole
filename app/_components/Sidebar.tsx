import { Rabbit } from './Rabbit';
import { SHOW_MEMBERSHIP } from '@/app/_lib/flags';

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
          Top-voted holes go in a physical book. Yes, physical.
          <em> Voting is optional, obviously.</em>
        </p>
        <p className="pro-copy">
          <em>We&apos;re writing the thing first. Membership launches once there&apos;s enough worth paying for.</em>
        </p>
        <div className="pro-soon">
          <span className="pro-soon-badge">Coming soon</span>
          <span className="pro-note">£9/mo · you can cancel, we won&apos;t make it weird</span>
        </div>
      </div>
    </div>
  );
}

function Manifesto() {
  return (
    <div className="side-block span">
      <div className="manifesto">
        <p className="lead">A few things rabbithole is not:</p>
        <p className="strike">Your morning routine.</p>
        <p className="strike">Anything with the word &ldquo;journey&rdquo; in it.</p>
        <p className="strike">5 lessons. 7 habits. 10 things.</p>
        <p className="strike">What running a marathon taught me about B2B sales.</p>
        <p className="strike">Actionable.</p>
        <p>Content. Well, technically.</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      {SHOW_MEMBERSHIP && <ProBook />}
      <Manifesto />
    </aside>
  );
}