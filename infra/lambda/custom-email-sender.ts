import { buildClient, CommitmentPolicy, KmsKeyringNode } from '@aws-crypto/client-node';

const { decrypt } = buildClient(CommitmentPolicy.FORBID_ENCRYPT_ALLOW_DECRYPT);

interface CognitoCustomEmailEvent {
  triggerSource: string;
  userPoolId: string;
  callerContext: { clientId: string };
  request: {
    code: string;
    userAttributes: Record<string, string>;
  };
}

export const handler = async (event: CognitoCustomEmailEvent): Promise<void> => {
  const { triggerSource, request } = event;
  const { code: encryptedCode, userAttributes } = request;

  const keyring = new KmsKeyringNode({ keyIds: [process.env.KMS_KEY_ARN!] });
  const { plaintext } = await decrypt(keyring, Buffer.from(encryptedCode, 'base64'));
  const code = plaintext.toString('utf-8');

  const email = userAttributes['email'];
  let subject: string;
  let html: string;
  let text: string;

  if (
    triggerSource === 'CustomEmailSender_SignUp' ||
    triggerSource === 'CustomEmailSender_ResendCode'
  ) {
    subject = 'Your Rabbithole verification code';
    html = verificationHtml(code);
    text = `Your Rabbithole verification code: ${code}\n\nExpires in 24 hours.`;
  } else if (triggerSource === 'CustomEmailSender_ForgotPassword') {
    subject = 'Reset your Rabbithole password';
    html = passwordResetHtml(code);
    text = `Your Rabbithole password reset code: ${code}\n\nExpires in 1 hour.`;
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
      from: 'Rabbithole <hello@the-rabbit-hole.app>',
      to: [email],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend error: ${res.status} ${await res.text()}`);
  }
};

function verificationHtml(code: string): string {
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
  <h1 style="font-size:26px;font-weight:400;margin:0 0 24px;">Here's your code. Don't overthink it.</h1>
  <p style="font-size:36px;font-weight:700;letter-spacing:0.12em;margin:0 0 24px;font-family:ui-monospace,monospace;">${code}</p>
  <p style="font-size:14px;color:#57534a;margin:0;">Expires in 24 hours. If you didn't sign up, someone out there has your email address and a strong interest in long-form writing about things nobody asked about. Probably fine.</p>
</div>`;
}

function passwordResetHtml(code: string): string {
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
  <h1 style="font-size:26px;font-weight:400;margin:0 0 24px;">Password reset</h1>
  <p style="font-size:36px;font-weight:700;letter-spacing:0.12em;margin:0 0 24px;font-family:ui-monospace,monospace;">${code}</p>
  <p style="font-size:14px;color:#57534a;margin:0;">Expires in 1 hour. If you didn't request this, ignore this.</p>
</div>`;
}