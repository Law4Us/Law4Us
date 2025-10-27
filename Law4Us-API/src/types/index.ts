/**
 * Type definitions for Law4Us API
 */

export type ClaimType = "divorceAgreement" | "divorce" | "property" | "custody" | "alimony";

export interface BasicInfo {
  fullName: string;
  idNumber: string;
  address: string;
  phone: string;
  email: string;
  birthDate: string;
  fullName2: string;
  idNumber2: string;
  address2: string;
  phone2: string;
  email2: string;
  birthDate2: string;
  relationshipType: "married" | "commonLaw" | "separated" | "notMarried";
  weddingDay: string;
}

export interface FormData {
  [key: string]: any;
  children?: Child[];
  apartments?: Property[];
  vehicles?: Property[];
  savings?: Financial[];
  benefits?: Financial[];
  debts?: Debt[];
}

export interface Child {
  firstName: string;
  lastName: string;
  idNumber: string;
  birthDate: string;
  address?: string;
  nameOfParent?: string;
  childRelationship?: string;
}

export interface Property {
  purchaseDate: string;
  owner: string;
  description?: string;
}

export interface Financial {
  amount: string;
  owner: string;
  description?: string;
}

export interface Debt extends Financial {
  date?: string;
  purpose?: string;
  appendix?: string;
  attachmentFile?: UploadedFile;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface DocumentGenerationRequest {
  claimType?: ClaimType;
  generateAll?: boolean;
  basicInfo: BasicInfo;
  formData: FormData;
  selectedClaims: ClaimType[];
  signature?: string; // base64 encoded image
  attachments?: AttachmentMapping;
}

export interface AttachmentMapping {
  [key: string]: UploadedFile; // e.g., "debt_0_attachment" -> file
}

export interface DocumentGenerationResponse {
  success: boolean;
  message: string;
  documentUrl?: string;
  documents?: { [key: string]: string };
  error?: string;
}

export interface AttachmentPage {
  label: string; // e.g., "נספח א"
  file: UploadedFile;
  pageNumber: number;
}

export interface ProcessedAttachment {
  label: string;
  images: Buffer[]; // Each page as PNG buffer
  originalFile: UploadedFile;
}
