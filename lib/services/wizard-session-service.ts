import { client } from '@/sanity/client';
import { WizardState } from '@/lib/types';

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
  const totalAmount = wizardState.selectedClaims.length * 3900; // 3900 ₪ per claim

  const session: any = {
    _type: 'wizardSession',
    sessionId,
    email,
    phone,
    fullName: wizardState.basicInfo?.fullName,
    wizardData: {
      currentStep: wizardState.currentStep,
      selectedClaims: wizardState.selectedClaims,
      basicInfo: wizardState.basicInfo,
      formData: wizardState.formData,
      signature: wizardState.signature,
      paymentData: wizardState.paymentData,
    },
    paymentStatus: 'pending',
    submissionStatus: 'pending',
    totalAmount,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    remindersSent: 0,
  };

  const result = await client.create(session);

  console.log(`✅ Created wizard session: ${sessionId}`);

  return result as unknown as WizardSession;
}

/**
 * Get a wizard session by ID
 */
export async function getWizardSession(sessionId: string): Promise<WizardSession | null> {
  const query = `*[_type == "wizardSession" && sessionId == $sessionId][0]`;
  const result = await client.fetch(query, { sessionId });

  return result || null;
}

/**
 * Get a wizard session by email
 */
export async function getWizardSessionByEmail(email: string): Promise<WizardSession[]> {
  const query = `*[_type == "wizardSession" && email == $email] | order(createdAt desc)`;
  const results = await client.fetch(query, { email });

  return results || [];
}

/**
 * Update wizard session payment status
 */
export async function updateSessionPaymentStatus(
  sessionId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  paymentIntentId?: string
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
 * (paid but not submitted, created more than 15 minutes ago, less than 3 reminders sent)
 */
export async function getSessionsNeedingReminders(): Promise<WizardSession[]> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const query = `*[
    _type == "wizardSession" &&
    paymentStatus == "paid" &&
    submissionStatus == "pending" &&
    createdAt < $fifteenMinutesAgo &&
    remindersSent < 3
  ] | order(createdAt asc)`;

  const results = await client.fetch(query, { fifteenMinutesAgo });

  return results || [];
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

  return results || [];
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
    wizardData: {
      ...session.wizardData,
      ...wizardState,
    },
  };

  await client.patch(session._id).set(updates).commit();

  console.log(`✅ Updated wizard data for session ${sessionId}`);
}
