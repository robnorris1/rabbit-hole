const FROM = 'Rabbithole <noreply@the-rabbit-hole.app>';

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
      subject: `You're @${username} now.`,
      html: welcomeHtml(username),
    }),
  });

  if (!res.ok) {
    console.error('Welcome email failed:', await res.text());
  }
}

function welcomeHtml(username: string): string {
  return `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:520px;margin:0 auto;padding:48px 24px;background:#f4f0e7;color:#1b1a18;">
  <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#57534a;margin:0 0 32px;">Rabbithole</p>
  <h1 style="font-size:28px;font-weight:400;margin:0 0 24px;line-height:1.25;">You're @${username} now.</h1>
  <p style="font-size:16px;line-height:1.6;color:#57534a;margin:0 0 16px;">We could say "welcome to the community." We're not going to do that.</p>
  <p style="font-size:16px;line-height:1.6;color:#57534a;margin:0 0 16px;">At some point you went too deep on something — the kind of thing you bring up at dinner parties and watch people's eyes glaze over. Write about that. What started it, what you found, why you can't leave it alone.</p>
  <p style="font-size:16px;line-height:1.6;color:#57534a;margin:0 0 32px;">That's the whole brief.</p>
  <a href="https://the-rabbit-hole.app/write" style="display:inline-block;padding:12px 24px;background:#1b1a18;color:#f4f0e7;text-decoration:none;font-size:13px;letter-spacing:0.06em;font-family:Helvetica,Arial,sans-serif;">Write something</a>
</div>`;
}