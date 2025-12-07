/**
 * Question Visibility Utility
 *
 * Determines which questions should be shown based on:
 * 1. Whether it was already answered in routing
 * 2. Whether the relevant claims are selected
 * 3. Whether there's a claim-specific alternative
 */

import type { RoutingAnswers, WizardPath, ClaimType } from '@/lib/types';

export interface VisibilityContext {
  wizardPath: WizardPath;
  routingAnswers: RoutingAnswers;
  selectedClaims: ClaimType[];
}

/**
 * Maps question IDs to routing answer keys
 * If the routing answer exists, the question should be hidden (already answered)
 */
const ROUTING_QUESTION_MAP: Record<string, keyof RoutingAnswers> = {
  'divorce.infidelity': 'hasInfidelity',
  'divorce.youngestChildAge': 'youngestChildAge',
  'divorce.careerDisparity': 'applicantIncome',
  'divorce.significantProperty': 'propertyTypes',
  'divorce.halachicGrounds': 'halachicGrounds',
};

/**
 * Determines if a question should be shown based on:
 * 1. Whether it was already answered in routing
 * 2. Whether the relevant claims are selected
 * 3. Whether there's a claim-specific alternative
 */
export function shouldShowQuestion(
  questionId: string,
  context: VisibilityContext
): boolean {
  const { wizardPath, routingAnswers, selectedClaims } = context;

  // Check if this is a routing-related divorce question
  if (ROUTING_QUESTION_MAP[questionId]) {
    // If guided path AND this was answered in routing, hide it
    if (wizardPath === 'guided' && routingAnswers[ROUTING_QUESTION_MAP[questionId]]) {
      return false;
    }
    // If divorce not selected, hide divorce-specific questions
    if (!selectedClaims.includes('divorce') && !selectedClaims.includes('divorceRabbinical')) {
      return false;
    }
  }

  // Hide divorce.currentSituation - routing already determined this
  if (questionId === 'divorce.currentSituation') {
    return wizardPath !== 'guided';
  }

  // Hide heading-divorce-routing if all its questions are hidden
  if (questionId === 'heading-divorce-routing') {
    // Only show if we need to show at least one routing question
    if (wizardPath === 'guided') return false;
    if (!selectedClaims.includes('divorce') && !selectedClaims.includes('divorceRabbinical')) return false;
  }

  // relationshipDescription - hide if claim-specific narrative exists
  if (questionId === 'relationshipDescription' || questionId === 'heading-relationship') {
    const hasDivorce = selectedClaims.includes('divorce') || selectedClaims.includes('divorceRabbinical');
    const hasShalomBayit = selectedClaims.includes('shalomBayit');

    // Hide if user will fill a claim-specific narrative
    if (hasDivorce || hasShalomBayit) {
      return false;
    }
  }

  // Default: show the question
  return true;
}

/**
 * Filters an array of questions based on visibility
 */
export function filterVisibleQuestions<T extends { id: string }>(
  questions: T[],
  context: VisibilityContext
): T[] {
  return questions.filter(q => shouldShowQuestion(q.id, context));
}
