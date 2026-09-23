import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/app/_components/LegalPage';
import { getSession } from '@/app/_lib/session';
import { getUserByCognitoSub } from '@/db/queries/users';

export const metadata: Metadata = { title: 'Terms' };

export default async function TermsPage() {
  const session = await getSession();
  const currentUser = session ? await getUserByCognitoSub(session.sub) : null;

  return (
    <LegalPage
      kicker="Terms"
      title="The rules."
      updated="23 September 2026"
      currentUser={currentUser ? { username: currentUser.username } : null}
      lede={
        <>
          Lord Denning would be proud. He once opened a judgment with &ldquo;It was bluebell time in
          Kent.&rdquo; We couldn&apos;t work bluebells in, but these are in plain English and you can
          finish them before your tea goes cold.
        </>
      }
    >
      <h2>The basics</h2>
      <p>
        rabbithole (the-rabbit-hole.app) is run from the UK. &ldquo;We&rdquo; and &ldquo;us&rdquo;
        means the people running it. By using the site you agree to these terms. If you don&apos;t
        agree, that&apos;s fine, but please don&apos;t use it.
      </p>
      <p>You need to be at least 13 to make an account.</p>

      <h2>Your account</h2>
      <p>
        One account per person. Keep your password to yourself. You&apos;re responsible for anything
        posted from your account, so if you think someone else has got into it, tell us at{' '}
        <a href="mailto:hello@the-rabbit-hole.app">hello@the-rabbit-hole.app</a>.
      </p>

      <h2>Your writing is yours</h2>
      <p>
        You keep the copyright in everything you write here. We don&apos;t own it and never will.
      </p>
      <p>
        When you publish a rabbit hole, you give us a non-exclusive, worldwide, royalty-free licence
        to host, display, reproduce and distribute it, both on rabbithole and in things that promote
        or come from rabbithole. That includes printed collections, like a book of the best rabbit
        holes. We&apos;ll always credit you by your username.
      </p>
      <p>
        The licence ends when you delete the rabbit hole or your account, apart from copies that
        have already been printed or shared, which we can&apos;t get back.
      </p>
      <p>
        By publishing, you&apos;re confirming it&apos;s your own work, or that you have the right to
        use anything in it that isn&apos;t.
      </p>

      <h2>What you can&apos;t post</h2>
      <ul>
        <li>Anything illegal, or anything that encourages someone else to do something illegal.</li>
        <li>Someone else&apos;s writing passed off as yours.</li>
        <li>Harassment, threats, or content attacking people for who they are.</li>
        <li>Sexual content involving anyone under 18. This gets reported to the police.</li>
        <li>Other people&apos;s personal information without their permission.</li>
        <li>Pretending to be someone you&apos;re not.</li>
        <li>Spam, adverts, or pieces that exist to rank a website on Google.</li>
      </ul>

      <h2>Reports and moderation</h2>
      <p>
        If you see something that breaks these rules, use the flag option on the rabbit hole, or
        email <a href="mailto:hello@the-rabbit-hole.app">hello@the-rabbit-hole.app</a>. We read every
        report.
      </p>
      <p>
        We can remove content or suspend accounts that break these terms. If we remove something of
        yours and you think we got it wrong, email us and a human will look at it again. The same
        address works for any other complaint about how we&apos;ve handled things.
      </p>

      <h2>Deleting things</h2>
      <p>
        You can edit your rabbit holes at any time. To delete one, or to delete your account and
        everything in it, email{' '}
        <a href="mailto:hello@the-rabbit-hole.app">hello@the-rabbit-hole.app</a> from the address
        you signed up with. The <Link href="/privacy">privacy policy</Link> explains what happens to
        your data after that.
      </p>

      <h2>The small print</h2>
      <p>
        rabbithole is provided as it is. We&apos;ll try to keep it running and not lose anything, but
        we can&apos;t promise it will always be available, and we might change or close it. If we
        close it, we&apos;ll give you notice so you can take a copy of your writing.
      </p>
      <p>
        As far as the law allows, we&apos;re not liable for indirect losses from using the site.
        Nothing here limits liability for death or personal injury caused by negligence, for fraud,
        or for anything else that can&apos;t legally be limited, and none of it affects your
        statutory rights.
      </p>

      <h2>Changes</h2>
      <p>
        If we change these terms we&apos;ll update the date at the top. If the change is
        significant, we&apos;ll email you first.
      </p>

      <h2>Law</h2>
      <p>These terms are governed by the law of England and Wales.</p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:hello@the-rabbit-hole.app">hello@the-rabbit-hole.app</a>. A person reads it.
      </p>
    </LegalPage>
  );
}
