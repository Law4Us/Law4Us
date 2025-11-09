import { create } from "zustand";
import type { ClaimType, BasicInfo, FormData, WizardState } from "../types";

const STORAGE_KEY = "law4us-wizard-v1";
const AUTO_SAVE_DELAY = 2000; // 2 seconds

interface WizardStore extends WizardState {
  // Navigation actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  canNavigateToStep: (targetStep: number) => boolean;

  // Data update actions
  setSelectedClaims: (claims: ClaimType[]) => void;
  toggleClaim: (claim: ClaimType) => void;
  updateBasicInfo: (info: Partial<BasicInfo>) => void;
  updateFormData: (data: Partial<FormData>) => void;
  setSignature: (signature: string) => void;
  setPaymentData: (data: { paid: boolean; date?: Date }) => void;
  setFilledDocuments: (docs: { [key: string]: string }) => void;
  setSessionId: (sessionId: string) => void;

  // Storage actions
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  clearLocalStorage: () => void;
  reset: () => void;
}

// Initial state
const initialState: WizardState = {
  currentStep: 0,
  maxReachedStep: 0,
  selectedClaims: [],
  basicInfo: {
    fullName: "",
    idNumber: "",
    address: "",
    phone: "",
    email: "",
    birthDate: "",
    gender: "male",
    fullName2: "",
    idNumber2: "",
    address2: "",
    phone2: "",
    email2: "",
    birthDate2: "",
    gender2: "male",
    relationshipType: "married",
    weddingDay: "",
  },
  formData: {},
  signature: "",
  paymentData: {
    paid: false,
  },
  filledDocuments: {},
};

// Auto-save timer
let autoSaveTimer: NodeJS.Timeout | null = null;

export const useWizardStore = create<WizardStore>((set, get) => ({
  ...initialState,

  // Navigation
  setStep: (step) =>
    set((state) => ({
      currentStep: step,
      maxReachedStep: Math.max(state.maxReachedStep, step),
    })),

  nextStep: () =>
    set((state) => {
      const next = Math.min(state.currentStep + 1, 4); // Max 4 (5 steps: 0-4)
      return {
        currentStep: next,
        maxReachedStep: Math.max(state.maxReachedStep, next),
      };
    }),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    })),

  canNavigateToStep: (targetStep) => {
    const state = get();

    // Can always go to current step
    if (targetStep === state.currentStep) return true;

    // Can't go beyond max reached step
    if (targetStep > state.maxReachedStep) return false;

    // Special rule: Can't navigate back to payment step (step 3) once completed
    // This prevents users from double-paying or bypassing payment
    if (targetStep === 3 && state.paymentData.paid && state.currentStep > 3) {
      return false;
    }

    // Can navigate to any previously completed step
    return targetStep <= state.maxReachedStep;
  },

  goToStep: (step) =>
    set((state) => {
      const canNavigate = get().canNavigateToStep(step);

      if (canNavigate) {
        return { currentStep: step };
      }

      console.warn(`Navigation to step ${step} is not allowed`);
      return state;
    }),

  // Data updates
  setSelectedClaims: (claims) => {
    set({ selectedClaims: claims });
    scheduleAutoSave(get);
  },

  toggleClaim: (claim) => {
    set((state) => {
      const isCurrentlySelected = state.selectedClaims.includes(claim);

      // If deselecting, just remove it
      if (isCurrentlySelected) {
        return { selectedClaims: state.selectedClaims.filter((c) => c !== claim) };
      }

      // If selecting divorceAgreement, clear all other claims (mutual exclusivity)
      if (claim === 'divorceAgreement') {
        return { selectedClaims: ['divorceAgreement'] };
      }

      // If selecting any other claim, remove divorceAgreement if it exists
      const otherClaims = state.selectedClaims.filter((c) => c !== 'divorceAgreement');
      return { selectedClaims: [...otherClaims, claim] };
    });
    scheduleAutoSave(get);
  },

  updateBasicInfo: (info) => {
    set((state) => ({
      basicInfo: { ...state.basicInfo, ...info },
    }));
    scheduleAutoSave(get);
  },

  updateFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
    scheduleAutoSave(get);
  },

  setSignature: (signature) => {
    set({ signature });
    scheduleAutoSave(get);
  },

  setPaymentData: (data) => {
    set({ paymentData: data });
    scheduleAutoSave(get);
  },

  setFilledDocuments: (docs) => {
    set({ filledDocuments: docs });
    scheduleAutoSave(get);
  },

  setSessionId: (sessionId) => {
    set({ sessionId });
    scheduleAutoSave(get);
  },

  // Storage
  saveToLocalStorage: () => {
    if (typeof window === "undefined") return;

    try {
      const state = get();
      const dataToSave = {
        currentStep: state.currentStep,
        maxReachedStep: state.maxReachedStep,
        selectedClaims: state.selectedClaims,
        basicInfo: state.basicInfo,
        formData: state.formData,
        signature: state.signature,
        paymentData: state.paymentData,
        filledDocuments: state.filledDocuments,
        sessionId: state.sessionId,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log("✅ Wizard state saved to localStorage");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  loadFromLocalStorage: () => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const data = JSON.parse(saved);

      // Check if data is recent (less than 7 days old)
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (data.timestamp && data.timestamp < sevenDaysAgo) {
        console.log("Saved data is too old, clearing...");
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      set({
        currentStep: data.currentStep || 0,
        maxReachedStep: data.maxReachedStep || 0,
        selectedClaims: data.selectedClaims || [],
        basicInfo: data.basicInfo || initialState.basicInfo,
        formData: data.formData || {},
        signature: data.signature || "",
        paymentData: data.paymentData || { paid: false },
        filledDocuments: data.filledDocuments || {},
        sessionId: data.sessionId,
      });

      console.log("✅ Wizard state loaded from localStorage");
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  clearLocalStorage: () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("✅ localStorage cleared");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  reset: () => {
    set(initialState);
    get().clearLocalStorage();
    console.log("✅ Wizard state reset");
  },
}));

// Debounced auto-save
function scheduleAutoSave(get: () => WizardStore) {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }

  autoSaveTimer = setTimeout(() => {
    get().saveToLocalStorage();
    autoSaveTimer = null;
  }, AUTO_SAVE_DELAY);
}

// Load from localStorage on mount (client-side only)
if (typeof window !== "undefined") {
  useWizardStore.getState().loadFromLocalStorage();
}
