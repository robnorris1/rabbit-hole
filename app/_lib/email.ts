const FROM = 'Rabbithole <hello@the-rabbit-hole.app>';

export async function sendWelcomeEmail(to: string, username: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: `welcome, @${username}.`,
      html: welcomeHtml(username),
      text: welcomeText(username),
    }),
  });

  if (!res.ok) {
    console.error('Welcome email failed:', await res.text());
  }
}

function welcomeText(username: string): string {
  return `welcome, @${username}.\n\nyou'll figure it out.\n\nhttps://the-rabbit-hole.app/write`;
}

function welcomeHtml(username: string): string {
  return `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:520px;margin:0 auto;padding:48px 24px;background:#f4f0e7;color:#1b1a18;">
  <svg width="40" height="34" viewBox="0 0 48 40" fill="none" stroke="#1b1a18" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 0 16px;display:block;" aria-hidden="true">
    <path d="M21 23 C 16.5 15 16 7 19 5 C 22 6.5 22 15 22.5 23 Z"/>
    <path d="M27 23 C 31.5 15 32 7 29 5 C 26 6.5 26 15 25.5 23 Z"/>
    <path d="M13.5 30 A 10.5 10.5 0 0 1 34.5 30"/>
    <path d="M24 27.5 v1.4"/>
    <path d="M2 30 L 13 30"/>
    <path d="M35 30 L 46 30"/>
  </svg>
  <p style="font-size:11px;letter-spacing:0.1em;color:#57534a;margin:0 0 40px;font-family:Helvetica,Arial,sans-serif;">rabbithole</p>
  <h1 style="font-size:26px;font-weight:400;margin:0 0 16px;">welcome, @${username}.</h1>
  <p style="font-size:16px;line-height:1.6;color:#57534a;margin:0 0 32px;">you'll figure it out.</p>
  <a href="https://the-rabbit-hole.app/write" style="display:inline-block;padding:12px 24px;background:#1b1a18;color:#f4f0e7;text-decoration:none;font-size:13px;letter-spacing:0.06em;font-family:Helvetica,Arial,sans-serif;">write something</a>
</div>`;
}