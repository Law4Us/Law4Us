/**
 * Divorce Court Router
 * Determines whether a divorce case should go to:
 * - בית דין רבני (Rabbinical Court) - bundled divorce with custody/alimony/property
 * - בית משפט לענייני משפחה (Family Court) - separate claims
 *
 * Based on lawyer's guidance:
 * - Infidelity → Family Court
 * - Young children (under 6) → Family Court (more equality in custody)
 * - Large property/career disparity → Rabbinical Court
 * - Halachic grounds for divorce → Rabbinical Court
 */

export type DivorceCourtType = 'rabbinical' | 'family';

export type DivorceTrack = 'divorce' | 'shalomBayit';

export interface BundledClaims {
  property: boolean;
  custody: boolean;
  alimony: boolean;
}

export interface DivorceRoutingResult {
  /** Which court the case should go to */
  courtType: DivorceCourtType;
  /** Which track within divorce (regular divorce or shalom bayit) */
  track: DivorceTrack;
  /** Claims to bundle with divorce (only for rabbinical court) */
  bundledClaims: BundledClaims;
  /** Suggested additional claims for family court path */
  suggestedClaims: string[];
  /** Reasons for the routing decision (for internal use/debugging) */
  reasons: string[];
}

interface Step4Data {
  'divorce.currentSituation'?: string;
  'divorce.infidelity'?: string;
  'divorce.youngestChildAge'?: string;
  'divorce.careerDisparity'?: string;
  'divorce.significantProperty'?: string;
  'divorce.halachicGrounds'?: string;
  'divorce.childrenDispute'?: string;
  'divorce.needSupport'?: string;
  'divorce.propertyDispute'?: string;
  [key: string]: string | string[] | undefined;
}

interface FormData {
  step4?: Step4Data;
  [key: string]: unknown;
}

/**
 * Determines the court type and track based on user's answers
 */
export function determineCourtType(formData: FormData): DivorceRoutingResult {
  const step4 = formData.step4 || {};
  const reasons: string[] = [];

  // ========== STEP 1: Check for Shalom Bayit track ==========
  const currentSituation = step4['divorce.currentSituation'];

  if (currentSituation === 'wantReconciliation' || currentSituation === 'partnerWantsDivorce') {
    reasons.push('User wants reconciliation or partner wants divorce - routing to Shalom Bayit track');
    return {
      courtType: 'rabbinical', // Shalom Bayit always goes to rabbinical court
      track: 'shalomBayit',
      bundledClaims: { property: false, custody: false, alimony: false },
      suggestedClaims: [],
      reasons
    };
  }

  // ========== STEP 2: Extract routing factors ==========
  const hasInfidelity = step4['divorce.infidelity'] === 'כן';
  const hasYoungChildren = step4['divorce.youngestChildAge'] === 'under6';
  const hasCareerDisparity =
    step4['divorce.careerDisparity'] === 'iEarnMore' ||
    step4['divorce.careerDisparity'] === 'partnerEarnsMore';
  const hasSignificantProperty = step4['divorce.significantProperty'] === 'כן';
  const halachicGround = step4['divorce.halachicGrounds'];
  const hasHalachicGrounds = halachicGround && halachicGround !== 'none';

  // For bundling decisions
  const hasChildrenDispute = step4['divorce.childrenDispute'] === 'כן';
  const needsSupport = step4['divorce.needSupport'] === 'כן';
  const hasPropertyDispute = step4['divorce.propertyDispute'] === 'כן';

  // ========== STEP 3: Apply routing rules ==========

  // RULE 1: Infidelity ALWAYS goes to family court
  if (hasInfidelity) {
    reasons.push('Infidelity present - routing to Family Court');
    return {
      courtType: 'family',
      track: 'divorce',
      bundledClaims: { property: false, custody: false, alimony: false },
      suggestedClaims: buildSuggestions(hasChildrenDispute, needsSupport, hasPropertyDispute),
      reasons
    };
  }

  // RULE 2: Young children (under 6) + no strong rabbinical factors → family court
  if (hasYoungChildren && !hasSignificantProperty && !hasCareerDisparity && !hasHalachicGrounds) {
    reasons.push('Young children under 6 with no strong rabbinical factors - routing to Family Court');
    return {
      courtType: 'family',
      track: 'divorce',
      bundledClaims: { property: false, custody: false, alimony: false },
      suggestedClaims: buildSuggestions(hasChildrenDispute, needsSupport, hasPropertyDispute),
      reasons
    };
  }

  // RULE 3: Property/career disparity or Halachic grounds → rabbinical court
  if (hasSignificantProperty || hasCareerDisparity || hasHalachicGrounds) {
    const bundleReasons: string[] = [];

    if (hasSignificantProperty) {
      bundleReasons.push('Significant property');
    }
    if (hasCareerDisparity) {
      bundleReasons.push('Career/income disparity');
    }
    if (hasHalachicGrounds) {
      bundleReasons.push('Halachic grounds for divorce');
    }

    reasons.push(`Strong rabbinical factors: ${bundleReasons.join(', ')} - routing to Rabbinical Court`);

    return {
      courtType: 'rabbinical',
      track: 'divorce',
      bundledClaims: {
        property: hasPropertyDispute || hasSignificantProperty,
        custody: hasChildrenDispute,
        alimony: needsSupport
      },
      suggestedClaims: [],
      reasons
    };
  }

  // DEFAULT: Rabbinical court (standard path for Jewish divorce in Israel)
  reasons.push('Default routing - Rabbinical Court (standard Jewish divorce in Israel)');
  return {
    courtType: 'rabbinical',
    track: 'divorce',
    bundledClaims: {
      property: hasPropertyDispute,
      custody: hasChildrenDispute,
      alimony: needsSupport
    },
    suggestedClaims: [],
    reasons
  };
}

/**
 * Builds suggestions for additional claims (used for family court path)
 */
function buildSuggestions(
  hasChildrenDispute: boolean,
  needsSupport: boolean,
  hasPropertyDispute: boolean
): string[] {
  const suggestions: string[] = [];

  if (hasChildrenDispute) {
    suggestions.push('תביעת משמורת');
  }
  if (needsSupport) {
    suggestions.push('תביעת מזונות');
  }
  if (hasPropertyDispute) {
    suggestions.push('תביעה רכושית');
  }

  return suggestions;
}

/**
 * Gets the Hebrew name for the court type
 */
export function getCourtTypeName(courtType: DivorceCourtType): string {
  return courtType === 'rabbinical'
    ? 'בית הדין הרבני'
    : 'בית המשפט לענייני משפחה';
}

/**
 * Gets the Hebrew name for the track
 */
export function getTrackName(track: DivorceTrack): string {
  return track === 'shalomBayit'
    ? 'שלום בית'
    : 'גירושין';
}

/**
 * New routing function using numeric income and property values
 * Used by the guided flow in wizard step 1
 */
interface NumericRoutingAnswers {
  situation?: 'agreement' | 'shalomBayit' | 'divorce' | 'defense' | 'specific';
  hasInfidelity?: 'yes' | 'no' | 'preferNotToSay';
  youngestChildAge?: 'none' | 'under6' | '6to12' | 'over12';
  applicantIncome?: number;
  respondentIncome?: number;
  propertyTypes?: string[];
  propertyValue?: 'under1m' | '1to2m' | '2to4m' | 'over4m' | 'unknown';
  halachicGrounds?: 'refusesRelations' | 'cantHaveChildren' | 'none' | 'unsure';
}

export interface NumericRoutingResult {
  court: 'family' | 'rabbinical';
  reasons: string[];
  familyScore: number;
  rabbinicalScore: number;
}

/**
 * Calculates court recommendation using numeric income values and specific property thresholds
 *
 * Scoring:
 * - Family Court default: +5 points (heavily weighted)
 * - Infidelity: +100 to Family (forces family court)
 * - Young children (<6): +2 to Family
 * - Income disparity (2x+): +3 to Rabbinical
 * - Property value (>2M): +2 to Rabbinical
 * - Has business: +2 to Rabbinical
 * - Halachic grounds: +3 to Rabbinical
 */
export function calculateCourtFromNumericAnswers(answers: NumericRoutingAnswers): NumericRoutingResult {
  const reasons: string[] = [];
  let familyScore = 5; // Default heavy weight to Family Court
  let rabbinicalScore = 0;

  // Force Family Court if infidelity
  if (answers.hasInfidelity === 'yes') {
    familyScore += 100;
    reasons.push('בגידה - מחייב בית משפט לענייני משפחה');
  }

  // Young children lean Family Court
  if (answers.youngestChildAge === 'under6') {
    familyScore += 2;
    reasons.push('ילדים צעירים (מתחת ל-6) - נוטה לבית משפט לענייני משפחה');
  }

  // Income disparity leans Rabbinical
  if (answers.applicantIncome && answers.respondentIncome) {
    const higher = Math.max(answers.applicantIncome, answers.respondentIncome);
    const lower = Math.min(answers.applicantIncome, answers.respondentIncome);
    if (lower > 0 && higher / lower >= 2) {
      rabbinicalScore += 3;
      reasons.push(`פער הכנסות משמעותי (יחס ${(higher / lower).toFixed(1)}:1) - נוטה לבית הדין הרבני`);
    }
  }

  // Significant property leans Rabbinical
  if (answers.propertyValue === '2to4m') {
    rabbinicalScore += 2;
    reasons.push('שווי נכס גבוה (2-4 מיליון) - נוטה לבית הדין הרבני');
  } else if (answers.propertyValue === 'over4m') {
    rabbinicalScore += 3;
    reasons.push('שווי נכס גבוה מאוד (מעל 4 מיליון) - נוטה לבית הדין הרבני');
  }

  // Has business leans Rabbinical
  if (answers.propertyTypes?.includes('business')) {
    rabbinicalScore += 2;
    reasons.push('עסק משותף - נוטה לבית הדין הרבני');
  }

  // Halachic grounds lean Rabbinical
  if (answers.halachicGrounds === 'refusesRelations') {
    rabbinicalScore += 3;
    reasons.push('עילה הלכתית (סירוב ליחסים) - נוטה לבית הדין הרבני');
  } else if (answers.halachicGrounds === 'cantHaveChildren') {
    rabbinicalScore += 3;
    reasons.push('עילה הלכתית (אי יכולת ללדת) - נוטה לבית הדין הרבני');
  }

  const court: 'family' | 'rabbinical' = rabbinicalScore > familyScore ? 'rabbinical' : 'family';

  if (court === 'family' && reasons.length === 0) {
    reasons.push('ברירת מחדל - בית משפט לענייני משפחה');
  }

  return {
    court,
    reasons,
    familyScore,
    rabbinicalScore
  };
}
