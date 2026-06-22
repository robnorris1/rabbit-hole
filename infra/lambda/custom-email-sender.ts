import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

interface CognitoCustomEmailEvent {
  triggerSource: string;
  request: {
    code: string;
    userAttributes: Record<string, string>;
  };
}

const kms = new KMSClient({});

export const handler = async (event: CognitoCustomEmailEvent): Promise<void> => {
  const { triggerSource, request } = event;
  const { code: encryptedCode, userAttributes } = request;

  const decryptResult = await kms.send(
    new DecryptCommand({ CiphertextBlob: Buffer.from(encryptedCode, 'base64') }),
  );
  const code = Buffer.from(decryptResult.Plaintext!).toString('utf-8');

  const email = userAttributes['email'];
  let subject: string;
  let html: string;

  if (
    triggerSource === 'CustomEmailSender_SignUp' ||
    triggerSource === 'CustomEmailSender_ResendCode'
  ) {
    subject = 'Your Rabbithole verification code';
    html = verificationHtml(code);
  } else if (triggerSource === 'CustomEmailSender_ForgotPassword') {
    subject = 'Reset your Rabbithole password';
    html = passwordResetHtml(code);
  } else {
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Rabbithole <noreply@the-rabbit-hole.app>',
      to: [email],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend error: ${res.status} ${await res.text()}`);
  }
};

function verificationHtml(code: string): string {
  return `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:520px;margin:0 auto;padding:48px 24px;background:#f4f0e7;color:#1b1a18;">
  <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#57534a;margin:0 0 32px;">Rabbithole</p>
  <h1 style="font-size:26px;font-weight:400;margin:0 0 24px;">Here's your code. Don't overthink it.</h1>
  <p style="font-size:36px;font-weight:700;letter-spacing:0.12em;margin:0 0 24px;font-family:ui-monospace,monospace;">${code}</p>
  <p style="font-size:14px;color:#57534a;margin:0;">Expires in 24 hours. If you didn't sign up, someone out there has your email address and a strong interest in long-form writing about things nobody asked about. Probably fine.</p>
</div>`;
}

function passwordResetHtml(code: string): string {
  return `
<div style="font-family:Georgia,'Times New Roman',serif;max-width:520px;margin:0 auto;padding:48px 24px;background:#f4f0e7;color:#1b1a18;">
  <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#57534a;margin:0 0 32px;">Rabbithole</p>
  <h1 style="font-size:26px;font-weight:400;margin:0 0 24px;">Password reset</h1>
  <p style="font-size:36px;font-weight:700;letter-spacing:0.12em;margin:0 0 24px;font-family:ui-monospace,monospace;">${code}</p>
  <p style="font-size:14px;color:#57534a;margin:0;">Expires in 1 hour. If you didn't request this, ignore this.</p>
</div>`;
}