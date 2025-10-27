/**
 * Core type definitions for the Law4Us application
 */

export type ClaimType = "divorceAgreement" | "divorce" | "property" | "custody" | "alimony";

export interface Claim {
  key: ClaimType;
  label: string;
  price: number;
}

export interface BasicInfo {
  // Applicant (תובע/בעל/אישה)
  fullName: string;
  idNumber: string;
  address: string;
  phone: string;
  email: string;
  birthDate: string;

  // Respondent (נתבע/בעל/אישה)
  fullName2: string;
  idNumber2: string;
  address2: string;
  phone2: string;
  email2: string;
  birthDate2: string;

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
  filledDocuments: {
    [key: string]: string;
  };
}
