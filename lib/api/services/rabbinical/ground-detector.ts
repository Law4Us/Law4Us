/**
 * Halachic Ground Detection System
 * Analyzes user input to determine which halachic grounds for divorce apply
 * Uses AI analysis combined with direct answer detection
 */

import { HalachicGroundType, getGroundByType } from './halachic-templates';

export interface DetectedGround {
  type: HalachicGroundType;
  confidence: number; // 0-1 score
  facts: string[];    // Specific facts from user's story supporting this ground
  applicable: boolean;
}

export interface GroundDetectionResult {
  grounds: DetectedGround[];
  primaryGround: HalachicGroundType | null;
  rawAnalysis?: string;
}

interface DivorceFormData {
  whoWantsDivorceAndWhy?: string;
  divorceReasons?: string;
  infidelity?: string;
  halachicGrounds?: string;
  policeComplaints?: string;
  policeComplaintsOutcome?: string;
  hadPreviousMediation?: string;
  previousMediationDetails?: string;
  currentSituation?: string;
}

interface FormDataWithDates {
  divorce?: DivorceFormData;
  basicInfo?: {
    weddingDay?: string;
    separationDate?: string;
  };
}

/**
 * Main ground detection function
 * Combines direct answer detection with AI analysis
 */
export async function detectHalachicGrounds(
  formData: FormDataWithDates,
  aiAnalyzer?: (userStory: string, divorceReasons: string) => Promise<AIGroundAnalysis | null>
): Promise<GroundDetectionResult> {
  const divorceData = formData.divorce || {};

  // Start with direct answer detection (always works, no AI needed)
  const directGrounds = detectFromDirectAnswers(divorceData, formData.basicInfo);

  // If AI analyzer is provided, enhance with AI analysis
  let aiGrounds: DetectedGround[] = [];
  if (aiAnalyzer && (divorceData.whoWantsDivorceAndWhy || divorceData.divorceReasons)) {
    try {
      const aiAnalysis = await aiAnalyzer(
        divorceData.whoWantsDivorceAndWhy || '',
        divorceData.divorceReasons || ''
      );
      if (aiAnalysis) {
        aiGrounds = parseAIAnalysis(aiAnalysis);
      }
    } catch (error) {
      console.warn('AI ground detection failed, using direct answers only:', error);
    }
  }

  // Merge and deduplicate grounds
  const mergedGrounds = mergeGrounds(directGrounds, aiGrounds);

  // Sort by confidence
  mergedGrounds.sort((a, b) => b.confidence - a.confidence);

  // Determine primary ground
  const primaryGround = mergedGrounds.length > 0 && mergedGrounds[0].applicable
    ? mergedGrounds[0].type
    : null;

  return {
    grounds: mergedGrounds,
    primaryGround
  };
}

/**
 * Detect grounds from direct answers in the form
 */
function detectFromDirectAnswers(
  divorceData: DivorceFormData,
  basicInfo?: { weddingDay?: string; separationDate?: string }
): DetectedGround[] {
  const grounds: DetectedGround[] = [];

  // Check infidelity direct question
  if (divorceData.infidelity === 'כן') {
    grounds.push({
      type: 'bgida',
      confidence: 1.0,
      facts: ['הנתבע/ת בגד/ה בנישואין כפי שצוין בשאלון'],
      applicable: true
    });
  }

  // Check halachic grounds direct question
  const halachicAnswer = divorceData.halachicGrounds;
  if (halachicAnswer) {
    switch (halachicAnswer) {
      case 'refusalRelations':
      case 'סירוב ליחסי אישות':
        grounds.push({
          type: 'moredet',
          confidence: 1.0,
          facts: ['סירוב ליחסי אישות'],
          applicable: true
        });
        break;
      case 'mentalHealth':
      case 'מצב נפשי':
      case 'בעיות נפשיות':
        grounds.push({
          type: 'mum',
          confidence: 1.0,
          facts: ['מצב נפשי ירוד'],
          applicable: true
        });
        break;
      case 'leftHome':
      case 'עזיבת הבית':
        grounds.push({
          type: 'moredet',
          confidence: 1.0,
          facts: ['עזיבת הבית ללא הסכמה'],
          applicable: true
        });
        break;
      case 'violence':
      case 'אלימות':
        grounds.push({
          type: 'moredet',
          confidence: 1.0,
          facts: ['התנהגות אלימה'],
          applicable: true
        });
        break;
    }
  }

  // Check police complaints (supports moredet ground)
  if (divorceData.policeComplaints === 'כן') {
    const existingMoredet = grounds.find(g => g.type === 'moredet');
    if (existingMoredet) {
      existingMoredet.facts.push('הוגשו תלונות במשטרה');
      existingMoredet.confidence = Math.min(1.0, existingMoredet.confidence + 0.1);
    } else {
      grounds.push({
        type: 'moredet',
        confidence: 0.7,
        facts: ['הוגשו תלונות במשטרה'],
        applicable: true
      });
    }
  }

  // Check separation duration for motHaNisuin
  const separationMonths = calculateSeparationMonths(basicInfo?.separationDate);
  if (separationMonths !== null && separationMonths >= 18) {
    grounds.push({
      type: 'motHaNisuin',
      confidence: 0.9,
      facts: [`הצדדים בפירוד מזה ${separationMonths} חודשים`],
      applicable: true
    });
  }

  // Check if mediation failed (supports motHaNisuin)
  if (divorceData.hadPreviousMediation === 'כן' && divorceData.previousMediationDetails) {
    const existingMot = grounds.find(g => g.type === 'motHaNisuin');
    if (existingMot) {
      existingMot.facts.push('ניסיונות גישור קודמים נכשלו');
      existingMot.confidence = Math.min(1.0, existingMot.confidence + 0.1);
    } else {
      grounds.push({
        type: 'motHaNisuin',
        confidence: 0.6,
        facts: ['ניסיונות גישור קודמים נכשלו'],
        applicable: true
      });
    }
  }

  // If no grounds detected, default to motHaNisuin
  if (grounds.length === 0) {
    grounds.push({
      type: 'motHaNisuin',
      confidence: 0.5,
      facts: ['הצדדים אינם חיים בשלום בית ומבקשים להתגרש'],
      applicable: true
    });
  }

  return grounds;
}

/**
 * Calculate months of separation from separation date
 */
function calculateSeparationMonths(separationDate?: string): number | null {
  if (!separationDate) return null;

  try {
    const separation = new Date(separationDate);
    const now = new Date();
    const months = (now.getFullYear() - separation.getFullYear()) * 12 +
                   (now.getMonth() - separation.getMonth());
    return months;
  } catch {
    return null;
  }
}

/**
 * AI Analysis result structure
 */
export interface AIGroundAnalysis {
  moredet?: {
    applicable: boolean;
    confidence: number;
    facts: string[];
  };
  mum?: {
    applicable: boolean;
    confidence: number;
    facts: string[];
  };
  motHaNisuin?: {
    applicable: boolean;
    confidence: number;
    facts: string[];
  };
  bgida?: {
    applicable: boolean;
    confidence: number;
    facts: string[];
  };
}

/**
 * Parse AI analysis into DetectedGround array
 */
function parseAIAnalysis(analysis: AIGroundAnalysis): DetectedGround[] {
  const grounds: DetectedGround[] = [];

  if (analysis.moredet?.applicable) {
    grounds.push({
      type: 'moredet',
      confidence: analysis.moredet.confidence || 0.7,
      facts: analysis.moredet.facts || [],
      applicable: true
    });
  }

  if (analysis.mum?.applicable) {
    grounds.push({
      type: 'mum',
      confidence: analysis.mum.confidence || 0.7,
      facts: analysis.mum.facts || [],
      applicable: true
    });
  }

  if (analysis.motHaNisuin?.applicable) {
    grounds.push({
      type: 'motHaNisuin',
      confidence: analysis.motHaNisuin.confidence || 0.7,
      facts: analysis.motHaNisuin.facts || [],
      applicable: true
    });
  }

  if (analysis.bgida?.applicable) {
    grounds.push({
      type: 'bgida',
      confidence: analysis.bgida.confidence || 0.7,
      facts: analysis.bgida.facts || [],
      applicable: true
    });
  }

  return grounds;
}

/**
 * Merge grounds from direct answers and AI analysis
 * Combines facts and takes highest confidence
 */
function mergeGrounds(direct: DetectedGround[], ai: DetectedGround[]): DetectedGround[] {
  const merged = new Map<HalachicGroundType, DetectedGround>();

  // Add direct grounds first
  for (const ground of direct) {
    merged.set(ground.type, { ...ground });
  }

  // Merge AI grounds
  for (const aiGround of ai) {
    const existing = merged.get(aiGround.type);
    if (existing) {
      // Combine facts (deduplicate)
      const allFacts = [...new Set([...existing.facts, ...aiGround.facts])];
      existing.facts = allFacts;
      // Take higher confidence
      existing.confidence = Math.max(existing.confidence, aiGround.confidence);
    } else {
      merged.set(aiGround.type, { ...aiGround });
    }
  }

  return Array.from(merged.values());
}

/**
 * Get applicable grounds sorted by confidence
 */
export function getApplicableGrounds(result: GroundDetectionResult): DetectedGround[] {
  return result.grounds.filter(g => g.applicable).sort((a, b) => b.confidence - a.confidence);
}

/**
 * Check if a specific ground type is detected
 */
export function hasGround(result: GroundDetectionResult, type: HalachicGroundType): boolean {
  return result.grounds.some(g => g.type === type && g.applicable);
}

/**
 * Get facts for a specific ground type
 */
export function getFactsForGround(result: GroundDetectionResult, type: HalachicGroundType): string[] {
  const ground = result.grounds.find(g => g.type === type);
  return ground?.facts || [];
}
