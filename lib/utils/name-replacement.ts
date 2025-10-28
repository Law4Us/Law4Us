/**
 * Replace placeholder names in question labels/options with actual names
 */

import { BasicInfo } from "../types";
import { Question } from "../constants/questions";

/**
 * Replace [APPLICANT_NAME] and [RESPONDENT_NAME] with actual names
 */
export function replacePlaceholderNames(
  text: string,
  basicInfo: BasicInfo
): string {
  return text
    .replace(/\[APPLICANT_NAME\]/g, basicInfo.fullName || "המבקש/ת")
    .replace(/\[RESPONDENT_NAME\]/g, basicInfo.fullName2 || "הנתבע/ת");
}

/**
 * Process a single question to replace placeholder names
 */
export function processQuestionNames(
  question: Question,
  basicInfo: BasicInfo
): Question {
  const processed = { ...question };

  // Replace in label
  if (processed.label) {
    processed.label = replacePlaceholderNames(processed.label, basicInfo);
  }

  // Replace in placeholder
  if (processed.placeholder) {
    processed.placeholder = replacePlaceholderNames(
      processed.placeholder,
      basicInfo
    );
  }

  // Replace in helper
  if (processed.helper) {
    processed.helper = replacePlaceholderNames(processed.helper, basicInfo);
  }

  // Replace in options
  if (processed.options) {
    processed.options = processed.options.map((option) => ({
      ...option,
      label: replacePlaceholderNames(option.label, basicInfo),
    }));
  }

  return processed;
}

/**
 * Process an array of questions to replace placeholder names
 */
export function processQuestionsNames(
  questions: Question[],
  basicInfo: BasicInfo
): Question[] {
  return questions.map((q) => processQuestionNames(q, basicInfo));
}
