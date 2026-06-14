import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

let _verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!_verifier) {
    _verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID!,
      tokenUse: 'id',
      clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    });
  }
  return _verifier;
}

export type SessionPayload = {
  sub: string;
  email: string;
};

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('rh-token')?.value;
  if (!token) return null;
  try {
    const payload = await getVerifier().verify(token);
    return { sub: payload.sub, email: payload.email as string };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect('/auth/sign-in');
  return session;
}