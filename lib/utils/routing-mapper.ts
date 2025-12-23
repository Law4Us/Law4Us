/**
 * Routing-to-FormData Mapper
 *
 * Maps routing answers from step 1 to formData fields for step 2
 * This ensures generators get the data they need without asking twice
 */

import type { RoutingAnswers, ClaimType, FormData } from '@/lib/types';

/**
 * Maps routing answers from step 1 to formData fields for step 2
 * This ensures generators get the data they need without asking twice
 */
export function mapRoutingToFormData(
  routing: RoutingAnswers,
  selectedClaims: ClaimType[]
): Partial<FormData> {
  const result: Partial<FormData> = {};

  // Only map if user went through routing (guided path)
  if (!routing || Object.keys(routing).length === 0) {
    return result;
  }

  // Pre-fill divorce.currentSituation based on selected claims
  // This is critical because many questions depend on this value
  if (selectedClaims.includes('divorceRabbinical')) {
    result['divorce.currentSituation'] = 'wantDivorce';
  } else if (selectedClaims.includes('shalomBayit')) {
    result['divorce.currentSituation'] = 'reconciliation';
  }

  // Map infidelity (routing → divorce.infidelity)
  if (routing.hasInfidelity) {
    result['divorce.infidelity'] =
      routing.hasInfidelity === 'yes' ? 'כן' :
      routing.hasInfidelity === 'no' ? 'לא' : 'preferNotToSay';
  }

  // Map youngest child age (routing → divorce.youngestChildAge + hasSharedChildren)
  if (routing.youngestChildAge) {
    const hasChildren = routing.youngestChildAge !== 'none';
    result['hasSharedChildren'] = hasChildren ? 'yes' : 'no';

    if (routing.youngestChildAge === 'none') {
      result['divorce.youngestChildAge'] = 'noChildren';
    } else if (routing.youngestChildAge === 'under6') {
      result['divorce.youngestChildAge'] = 'under6';
    } else {
      // over12 and 6to12 both map to 6andAbove
      result['divorce.youngestChildAge'] = '6andAbove';
    }
  }

  // Map income disparity (derived from applicantIncome + respondentIncome)
  if (routing.applicantIncome !== undefined && routing.respondentIncome !== undefined) {
    const appIncome = routing.applicantIncome || 0;
    const respIncome = routing.respondentIncome || 0;
    const higher = Math.max(appIncome, respIncome);
    const lower = Math.min(appIncome, respIncome);

    if (lower > 0 && higher / lower >= 2) {
      result['divorce.careerDisparity'] = appIncome > respIncome ? 'iEarnMore' : 'partnerEarnsMore';
    } else {
      result['divorce.careerDisparity'] = 'similar';
    }
  }

  // Map significant property (derived from propertyTypes)
  if (routing.propertyTypes) {
    const hasProperty = routing.propertyTypes.length > 0;
    result['divorce.significantProperty'] = hasProperty ? 'כן' : 'לא';
  }

  // Map halachic grounds directly
  if (routing.halachicGrounds) {
    // Map routing values to question option values
    const groundsMap: Record<string, string> = {
      'refusesRelations': 'refusalRelations',
      'cantHaveChildren': 'fertility',
      'none': 'none',
      'unsure': 'other',
    };
    result['divorce.halachicGrounds'] = groundsMap[routing.halachicGrounds] || routing.halachicGrounds;
  }

  return result;
}

/**
 * Syncs form data fields on submit
 * Copies claim-specific narratives to shared fields for generators
 */
export function syncFormDataFields(
  formData: FormData,
  selectedClaims: ClaimType[]
): FormData {
  const synced = { ...formData };

  // If divorceRabbinical selected, copy story to relationshipDescription
  // Note: 'divorce' claim no longer exists - divorces only at Rabbinical Court
  if (
    selectedClaims.includes('divorceRabbinical') &&
    formData['divorce.whoWantsDivorceAndWhy']
  ) {
    synced['relationshipDescription'] = formData['divorce.whoWantsDivorceAndWhy'];
  }

  // If shalomBayit selected, copy crisis reasons to relationshipDescription
  if (selectedClaims.includes('shalomBayit') && formData['shalomBayit.crisisReasons']) {
    synced['relationshipDescription'] = formData['shalomBayit.crisisReasons'];
  }

  return synced;
}
