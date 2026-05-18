import { serverClient as client } from '@/sanity/server-client';
import { WizardState } from '@/lib/types';
import { calculateTotal } from '@/lib/constants/claims';

const ENCODED_KEY_PREFIX = '__key_';
const SANITY_SAFE_KEY_PATTERN = /^\$?[a-zA-Z0-9_-]+$/;

export interface WizardSession {
  _id?: string;
  _type?: 'wizardSession';
  sessionId: string;
  email: string;
  phone?: string;
  fullName?: string;
  wizardData: {
    currentStep: number;
    selectedClaims: string[];
    basicInfo: any;
    formData: any;
    signature?: string;
    paymentData?: {
      paid: boolean;
      date?: Date;
    };
  };
  paymentIntentId?: string;
  paymentProvider?: string;
  growPaymentProcessId?: string;
  growPaymentProcessToken?: string;
  paymentTransactionId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  submissionStatus: 'pending' | 'submitted' | 'failed';
  driveSubmissionId?: string;
  totalAmount?: number;
  createdAt: string;
  paidAt?: string;
  submittedAt?: string;
  remindersSent: number;
  expiresAt: string;
  notes?: string;
}

function encodeSanityKey(key: string): string {
  if (SANITY_SAFE_KEY_PATTERN.test(key) && !key.startsWith(ENCODED_KEY_PREFIX)) {
    return key;
  }

  return `${ENCODED_KEY_PREFIX}${Buffer.from(key, 'utf8').toString('base64url')}`;
}

function decodeSanityKey(key: string): string {
  if (!key.startsWith(ENCODED_KEY_PREFIX)) {
    return key;
  }

  try {
    return Buffer.from(key.slice(ENCODED_KEY_PREFIX.length), 'base64url').toString('utf8');
  } catch {
    return key;
  }
}

export function encodeSanityKeys<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => encodeSanityKeys(item)) as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object') {
    const encoded: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      encoded[encodeSanityKey(key)] = encodeSanityKeys(nestedValue);
    }

    return encoded as T;
  }

  return value;
}

export function decodeSanityKeys<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => decodeSanityKeys(item)) as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === 'object') {
    const decoded: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      decoded[decodeSanityKey(key)] = decodeSanityKeys(nestedValue);
    }

    return decoded as T;
  }

  return value;
}

function decodeWizardSession(session: unknown): WizardSession {
  const typedSession = session as WizardSession;

  return {
    ...typedSession,
    wizardData: decodeSanityKeys(typedSession.wizardData),
  };
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LW4U-${year}-${random}`;
}

/**
 * Create a new wizard session in Sanity
 */
export async function createWizardSession(
  wizardState: WizardState,
  email: string,
  phone?: string
): Promise<WizardSession> {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Calculate total amount based on selected claims
  const totalAmount = calculateTotal(wizardState.selectedClaims);

  const session: any = {
    _type: 'wizardSession',
    sessionId,
    email,
    phone,
    fullName: wizardState.basicInfo?.fullName,
    wizardData: encodeSanityKeys({
      currentStep: wizardState.currentStep,
      selectedClaims: wizardState.selectedClaims,
      basicInfo: wizardState.basicInfo,
      formData: wizardState.formData,
      signature: wizardState.signature,
      paymentData: wizardState.paymentData,
    }),
    paymentStatus: 'pending',
    submissionStatus: 'pending',
    totalAmount,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    remindersSent: 0,
  };

  const result = await client.create(session);

  console.log(`✅ Created wizard session: ${sessionId}`);

  return decodeWizardSession(result);
}

/**
 * Get a wizard session by ID
 */
export async function getWizardSession(sessionId: string): Promise<WizardSession | null> {
  const query = `*[_type == "wizardSession" && sessionId == $sessionId][0]`;
  const result = await client.fetch(query, { sessionId });

  return result ? decodeWizardSession(result) : null;
}

/**
 * Get a wizard session by email
 */
export async function getWizardSessionByEmail(email: string): Promise<WizardSession[]> {
  const query = `*[_type == "wizardSession" && email == $email] | order(createdAt desc)`;
  const results = await client.fetch(query, { email });

  return (results || []).map(decodeWizardSession);
}

/**
 * Get a wizard session by Grow payment link process reference.
 */
export async function getWizardSessionByGrowPaymentProcess(
  growPaymentProcessId: string,
  growPaymentProcessToken?: string
): Promise<WizardSession | null> {
  const processId = growPaymentProcessId.trim();
  const processToken = growPaymentProcessToken?.trim();

  if (!processId) {
    return null;
  }

  const query = processToken
    ? `*[
        _type == "wizardSession" &&
        growPaymentProcessId == $processId &&
        growPaymentProcessToken == $processToken
      ][0]`
    : `*[
        _type == "wizardSession" &&
        growPaymentProcessId == $processId
      ][0]`;

  const result = await client.fetch(query, { processId, processToken });

  return result ? decodeWizardSession(result) : null;
}

/**
 * Save the Grow payment link process reference for later webhook confirmation.
 */
export async function updateSessionGrowPaymentReference(
  sessionId: string,
  growPaymentProcessId: string,
  growPaymentProcessToken?: string
): Promise<void> {
  const session = await getWizardSession(sessionId);

  if (!session || !session._id) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const processId = growPaymentProcessId.trim();
  const processToken = growPaymentProcessToken?.trim();

  if (!processId) {
    throw new Error('Missing Grow payment process ID');
  }

  await client
    .patch(session._id)
    .set({
      paymentProvider: 'grow',
      growPaymentProcessId: processId,
      ...(processToken ? { growPaymentProcessToken: processToken } : {}),
    })
    .commit();

  console.log(`✅ Stored Grow payment process for session ${sessionId}: ${processId}`);
}

/**
 * Update wizard session payment status
 */
export async function updateSessionPaymentStatus(
  sessionId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  paymentIntentId?: string,
  paymentTransactionId?: string
): Promise<void> {
  const session = await getWizardSession(sessionId);

  if (!session || !session._id) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const updates: any = {
    paymentStatus,
  };

  if (paymentStatus === 'paid') {
    updates.paidAt = new Date().toISOString();
  }

  if (paymentIntentId) {
    updates.paymentIntentId = paymentIntentId;
  }

  if (paymentTransactionId) {
    updates.paymentTransactionId = paymentTransactionId;
  }

  await client.patch(session._id).set(updates).commit();

  console.log(`✅ Updated payment status for session ${sessionId}: ${paymentStatus}`);
}

/**
 * Update wizard session submission status
 */
export async function updateSessionSubmissionStatus(
  sessionId: string,
  submissionStatus: 'pending' | 'submitted' | 'failed',
  driveSubmissionId?: string
): Promise<void> {
  const session = await getWizardSession(sessionId);

  if (!session || !session._id) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const updates: any = {
    submissionStatus,
  };

  if (submissionStatus === 'submitted') {
    updates.submittedAt = new Date().toISOString();
  }

  if (driveSubmissionId) {
    updates.driveSubmissionId = driveSubmissionId;
  }

  await client.patch(session._id).set(updates).commit();

  console.log(`✅ Updated submission status for session ${sessionId}: ${submissionStatus}`);
}

/**
 * Increment reminder count for a session
 */
export async function incrementSessionReminders(sessionId: string): Promise<void> {
  const session = await getWizardSession(sessionId);

  if (!session || !session._id) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  await client
    .patch(session._id)
    .set({ remindersSent: (session.remindersSent || 0) + 1 })
    .commit();

  console.log(`✅ Incremented reminders for session ${sessionId}`);
}

/**
 * Get all sessions that need reminders
 * (paid but not submitted, at least 1 day old, less than 3 reminders sent)
 *
 * CURRENT PLAN: Vercel Hobby
 * - Runs daily via Vercel Cron at 10 AM UTC
 * - Checks for sessions 1+ days old (24 hours)
 * - Sends up to 3 reminders per session
 *
 * WHEN UPGRADING TO PRO PLAN:
 * 1. Change oneDayAgo to fifteenMinutesAgo:
 *    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
 * 2. Update query parameter from $oneDayAgo to $fifteenMinutesAgo
 * 3. Update vercel.json to run every 30 minutes (see vercel.pro.json.example)
 * 4. This will send reminders much faster (within 30 min vs 24 hours)
 */
export async function getSessionsNeedingReminders(): Promise<WizardSession[]> {
  // HOBBY PLAN: Check sessions older than 1 day
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // PRO PLAN: Uncomment this and use in query below
  // const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const query = `*[
    _type == "wizardSession" &&
    paymentStatus == "paid" &&
    submissionStatus == "pending" &&
    paidAt < $oneDayAgo &&
    remindersSent < 3
  ] | order(paidAt asc)`;

  // PRO PLAN: Change { oneDayAgo } to { fifteenMinutesAgo: fifteenMinutesAgo }
  const results = await client.fetch(query, { oneDayAgo });

  return (results || []).map(decodeWizardSession);
}

/**
 * Get all orphaned sessions (paid but not submitted)
 */
export async function getOrphanedSessions(): Promise<WizardSession[]> {
  const query = `*[
    _type == "wizardSession" &&
    paymentStatus == "paid" &&
    submissionStatus == "pending"
  ] | order(createdAt desc)`;

  const results = await client.fetch(query);

  return (results || []).map(decodeWizardSession);
}

/**
 * Delete expired sessions (older than 30 days)
 */
export async function deleteExpiredSessions(): Promise<number> {
  const now = new Date().toISOString();

  const query = `*[_type == "wizardSession" && expiresAt < $now]._id`;
  const expiredIds = await client.fetch(query, { now });

  if (expiredIds.length === 0) {
    console.log('No expired sessions to delete');
    return 0;
  }

  // Delete in transaction
  const transaction = client.transaction();
  expiredIds.forEach((id: string) => transaction.delete(id));
  await transaction.commit();

  console.log(`✅ Deleted ${expiredIds.length} expired sessions`);

  return expiredIds.length;
}

/**
 * Update wizard data for a session
 */
export async function updateWizardData(
  sessionId: string,
  wizardState: Partial<WizardState>
): Promise<void> {
  const session = await getWizardSession(sessionId);

  if (!session || !session._id) {
    throw new Error(`Session not found: ${sessionId}`);
  }

  const updates = {
    wizardData: encodeSanityKeys({
      ...session.wizardData,
      ...wizardState,
    }),
  };

  await client.patch(session._id).set(updates).commit();

  console.log(`✅ Updated wizard data for session ${sessionId}`);
}
