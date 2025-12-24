/**
 * Core type definitions for the Law4Us application
 */

export type ClaimType =
  | "divorceAgreement"
  | "shalomBayit"
  | "divorceRabbinical"
  | "property"
  | "custody"
  | "alimony";

export interface Claim {
  key: ClaimType;
  label: string;
  description?: string;
  price: number;
  /** If true, this is a bundled package (price includes multiple claims) */
  isBundle?: boolean;
  /** For bundles, which claims are included */
  bundledClaims?: ClaimType[];
}

export interface BasicInfo {
  // Applicant (תובע/בעל/אישה)
  fullName: string;
  idNumber: string;
  address: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: "male" | "female";

  // Respondent (נתבע/בעל/אישה)
  fullName2: string;
  idNumber2: string;
  address2: string;
  phone2: string;
  email2: string;
  birthDate2: string;
  gender2: "male" | "female";

  // Relationship info
  relationshipType: "married" | "commonLaw" | "separated" | "notMarried";
  weddingDay: string;
}

export interface Child {
  __id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  idNumber: string;
  custody?: string;
}

export interface Need {
  name: string;
  amounts: string[];
}

export interface QuestionOption {
  label: string;
  value: string;
  fields?: Question[];
}

export interface Question {
  type: "text" | "number" | "date" | "email" | "tel" | "textarea" | "select" | "radio" | "file" | "fileList" | "repeater" | "needsTable" | "heading" | "shared";
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: QuestionOption[];
  fields?: Question[];
  sharedKey?: string;
  maxRows?: number;
  accept?: string;
  multiple?: boolean;
  description?: string;
  useDynamicNames?: boolean;
  useDynamicParties?: boolean;
}

export interface WizardStep {
  step: number;
  title: string;
  description?: string;
}

export interface FormData {
  [key: string]: any;
}

/** Path user chose in Section 4 */
export type WizardPath = "guided" | "direct" | null;

/** Court type recommendation from routing */
export type RecommendedCourt = "family" | "rabbinical" | null;

/** Routing answers from guided flow */
export interface RoutingAnswers {
  situation?: "agreement" | "shalomBayit" | "divorce" | "defense" | "specific";
  hasInfidelity?: "yes" | "no" | "preferNotToSay";
  youngestChildAge?: "none" | "under6" | "6to12" | "over12";
  applicantIncome?: number;
  respondentIncome?: number;
  propertyTypes?: string[];
  propertyValue?: "under1m" | "1to2m" | "2to4m" | "over4m" | "unknown";
  halachicGrounds?: "refusesRelations" | "cantHaveChildren" | "none" | "unsure";
}

/** Scheduled video call data for תצהיר בהיוועדות חזותית */
export interface ScheduledCallData {
  scheduled: boolean;
  eventId?: string;
  scheduledTime?: string; // ISO date string
  meetingUrl?: string;
}

export interface WizardState {
  currentStep: number;
  maxReachedStep: number;
  selectedClaims: ClaimType[];
  basicInfo: BasicInfo;
  formData: FormData;
  signature: string;
  paymentData: {
    paid: boolean;
    date?: Date;
  };
  scheduledCallData: ScheduledCallData;
  filledDocuments: {
    [key: string]: string;
  };
  sessionId?: string; // Session ID for payment recovery
  // Routing state
  wizardPath: WizardPath;
  routingAnswers: RoutingAnswers;
  recommendedCourt: RecommendedCourt;
}
