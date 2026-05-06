import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import type { SessionPayload } from './types'

const COOKIE  = 'smvs_session'
const MAX_AGE = 60 * 60 * 24 * 7  // 7 days

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return null
  return verifySession(token)
}

// Sets the session cookie using next/headers (reliable in App Router Route Handlers)
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = cookies()
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.set(COOKIE, '', { maxAge: 0, path: '/' })
}

export function getCookieFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE)?.value
}
