import type { Metadata } from 'next';
import { LegalPage } from '@/app/_components/LegalPage';
import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';

export const metadata: Metadata = { title: 'Privacy' };

export default async function PrivacyPage() {
  const session = await getSession();
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;

  return (
    <LegalPage
      kicker="Privacy"
      title="What we know about you."
      updated="23 September 2026"
      currentUser={currentUser ? { username: currentUser.username } : null}
      lede={
        <>
          Lord Denning would be proud of this one too. Short version: we collect as little as we can
          get away with, there&apos;s no tracking, and we don&apos;t sell anything to anyone.
        </>
      }
    >
      <h2>Who we are</h2>
      <p>
        rabbithole is run from the UK, and we&apos;re responsible for the personal data described
        here. Contact:{' '}
        <a href="mailto:hello@the-rabbit-hole.app">hello@the-rabbit-hole.app</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your account:</strong> email address and username. Your password is handled by
          Amazon Cognito and we never see it.
        </li>
        <li>
          <strong>Your profile:</strong> your bio, if you write one.
        </li>
        <li>
          <strong>What you write:</strong> drafts and published rabbit holes.
        </li>
        <li>
          <strong>What you do:</strong> which rabbit holes you upvote, who you follow, and anything
          you flag.
        </li>
        <li>
          <strong>Server logs:</strong> our hosting provider records things like IP addresses and
          browser details when pages are requested. We use these to keep the site working and
          secure.
        </li>
      </ul>

      <h2>What&apos;s public</h2>
      <p>
        Published rabbit holes, your username, your bio and your follower counts are visible to
        anyone. Drafts, your email address, and which holes you&apos;ve upvoted are not.
      </p>

      <h2>Why we use it</h2>
      <ul>
        <li>
          To run your account, publish what you write, and send the emails the service needs, like
          sign-up codes and a welcome email. The legal basis is that we need it to provide the
          service you signed up for.
        </li>
        <li>
          To deal with reports, stop abuse and keep the site secure. The legal basis is our
          legitimate interest in running a safe site.
        </li>
        <li>To meet legal obligations, if we ever have to.</li>
      </ul>
      <p>
        If we ever send anything like a newsletter or digest, we&apos;ll ask first and you can turn it
        off.
      </p>

      <h2>What we don&apos;t do</h2>
      <p>
        No adverts, no analytics, no tracking pixels, no selling or sharing your data for marketing.
        We&apos;d rather not know what you do on other websites.
      </p>

      <h2>Who else handles it</h2>
      <p>A few companies run parts of the site for us and only use your data to do that:</p>
      <ul>
        <li>
          <strong>Amazon Web Services:</strong> hosting, sign-in and verification emails. Based in
          London (eu-west-2), with pages cached on servers worldwide.
        </li>
        <li>
          <strong>Neon:</strong> our database, in London.
        </li>
        <li>
          <strong>Resend:</strong> sends our welcome emails. Resend is based in the US, so your email
          address and username may be processed there under the safeguards UK law requires for
          international transfers.
        </li>
        <li>
          <strong>Cloudflare:</strong> our domain, and forwarding for emails you send to
          hello@the-rabbit-hole.app.
        </li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We set two cookies when you sign in, <code>rh-token</code> and <code>rh-access</code>. They
        keep you signed in and are removed when you sign out. We also save your light or dark mode
        choice in your browser as <code>rh-dark</code>. All of these are strictly necessary or
        things you chose, which is why there&apos;s no cookie banner. There are no third-party
        cookies.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your data for as long as you have an account. If you ask us to delete your account,
        we&apos;ll delete it along with your rabbit holes, drafts, upvotes, follows and flags within
        30 days. Server logs are kept for a short time and then deleted automatically.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask for a copy of your data, ask us to correct it, ask us to delete it, object to how
        we use it, or ask for it in a format you can take elsewhere. Email{' '}
        <a href="mailto:hello@the-rabbit-hole.app">hello@the-rabbit-hole.app</a> from your account
        address and we&apos;ll reply within a month.
      </p>
      <p>
        If you&apos;re not happy with how we&apos;ve handled your data, you can complain to the
        Information Commissioner&apos;s Office at <a href="https://ico.org.uk">ico.org.uk</a>. We&apos;d
        appreciate the chance to sort it out first, though.
      </p>

      <h2>Children</h2>
      <p>rabbithole isn&apos;t for anyone under 13, and we don&apos;t knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes we&apos;ll update the date at the top, and email you if it&apos;s
        significant.
      </p>
    </LegalPage>
  );
}
