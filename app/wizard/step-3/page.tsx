"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { SignaturePad } from "@/components/wizard/signature-pad";
import { useWizardStore } from "@/lib/stores/wizard-store";
import {
  POWER_OF_ATTORNEY_TEMPLATE,
  FORM_3_TEMPLATE,
  fillDocumentTemplate,
  generateChildrenBlock,
  formatClaimTypesList,
  type DocumentData,
} from "@/lib/constants/document-templates";
import { CLAIMS } from "@/lib/constants/claims";
import { formatDate } from "@/lib/utils/format";

export default function Step3SignDocuments() {
  const router = useRouter();
  const {
    basicInfo,
    selectedClaims,
    signature,
    setSignature,
    claimAnswers,
    nextStep,
    prevStep,
  } = useWizardStore();

  // Prepare document data
  const documentData: DocumentData = React.useMemo(() => {
    // Get children from custody claim if exists
    const children = claimAnswers.custody?.children || [];

    // Get claim labels
    const claimLabels: { [key: string]: string } = {};
    CLAIMS.forEach((claim) => {
      claimLabels[claim.key] = claim.label;
    });

    return {
      fullName: basicInfo.fullName || "",
      idNumber: basicInfo.idNumber || "",
      address: basicInfo.address || "",
      phone: basicInfo.phone || "",
      email: basicInfo.email || "",
      birthDate: basicInfo.birthDate || "",
      fullName2: basicInfo.fullName2 || "",
      idNumber2: basicInfo.idNumber2 || "",
      address2: basicInfo.address2 || "",
      phone2: basicInfo.phone2 || "",
      email2: basicInfo.email2 || "",
      relationshipType: basicInfo.relationshipType || "",
      weddingDay: basicInfo.weddingDay || "",
      claimTypes: formatClaimTypesList(selectedClaims, claimLabels),
      childrenBlock: generateChildrenBlock(children),
      lawyerName: "עו\"ד אריאל דרור",
      signature: signature || "[חתימה תתווסף לאחר החתימה]",
      date: formatDate(new Date()),
    };
  }, [basicInfo, selectedClaims, claimAnswers, signature]);

  // Fill templates
  const powerOfAttorney = React.useMemo(
    () => fillDocumentTemplate(POWER_OF_ATTORNEY_TEMPLATE, documentData),
    [documentData]
  );

  const form3 = React.useMemo(
    () => fillDocumentTemplate(FORM_3_TEMPLATE, documentData),
    [documentData]
  );

  const handleSignatureChange = (sig: string) => {
    setSignature(sig);
  };

  const handleNext = () => {
    if (!signature) {
      alert("אנא חתמו על המסמכים לפני המשך");
      return;
    }
    nextStep();
    router.push("/wizard/step-4");
  };

  const handleBack = () => {
    prevStep();
    router.push("/wizard/step-2");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-h1 font-bold mb-2">חתימה על מסמכים</h1>
        <p className="text-body text-neutral-dark">
          אנא קראו את המסמכים בעיון וחתמו למטה
        </p>
      </div>

      {/* Document previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Power of Attorney */}
        <div className="bg-white rounded-lg p-6 border border-neutral">
          <h2 className="text-h3 font-semibold mb-4 pb-3 border-b border-neutral">
            ייפוי כוח לייצוג משפטי
          </h2>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-assistant text-body leading-relaxed">
              {powerOfAttorney}
            </pre>
          </div>
        </div>

        {/* Form 3 */}
        <div className="bg-white rounded-lg p-6 border border-neutral">
          <h2 className="text-h3 font-semibold mb-4 pb-3 border-b border-neutral">
            טופס 3 - הרצאת פרטים
          </h2>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-assistant text-body leading-relaxed">
              {form3}
            </pre>
          </div>
        </div>
      </div>

      {/* Signature section */}
      <div className="bg-neutral-lightest rounded-lg p-8 mb-8">
        <h2 className="text-h2 font-semibold mb-4">חתימתכם</h2>
        <p className="text-body text-neutral-dark mb-6">
          חתימתכם תופיע על כל המסמכים הרשומים למעלה
        </p>
        <SignaturePad value={signature} onChange={handleSignatureChange} />
      </div>

      {/* Validation warning */}
      {!signature && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-body font-medium text-amber-800">
            ⚠️ נדרשת חתימה כדי להמשיך
          </p>
          <p className="text-body-small text-amber-700 mt-1">
            אנא חתמו על המסמכים לפני המעבר לשלב הבא
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={handleBack}>
          חזור
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          disabled={!signature}
        >
          המשך לתשלום
        </Button>
      </div>

      {/* Auto-save indicator */}
      <div className="mt-4 text-center">
        <p className="text-caption text-neutral-dark">
          החתימה נשמרת אוטומטית
        </p>
      </div>
    </div>
  );
}
