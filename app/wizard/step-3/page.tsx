"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { SignaturePad } from "@/components/wizard/signature-pad";
import { DocumentReviewCard } from "@/components/wizard/document-review-card";
import { SlideInView } from "@/components/animations/slide-in-view";
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
    formData,
    nextStep,
    prevStep,
  } = useWizardStore();

  // Track document review state
  const [doc1Reviewed, setDoc1Reviewed] = React.useState(false);
  const [doc2Reviewed, setDoc2Reviewed] = React.useState(false);

  // Prepare document data
  const documentData: DocumentData = React.useMemo(() => {
    const children = formData.children || [];
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
  }, [basicInfo, selectedClaims, formData, signature]);

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

  // Check if can proceed
  const canProceed = doc1Reviewed && doc2Reviewed && signature;

  const handleNext = () => {
    if (!doc1Reviewed || !doc2Reviewed) {
      alert("אנא קראו ואשרו את כל המסמכים לפני המשך");
      return;
    }
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <SlideInView direction="up" delay={0}>
        <div className="mb-8 text-center">
          <h1 className="text-h1 font-bold mb-2">חתימה על מסמכים</h1>
          <p className="text-body text-neutral-dark mb-4">
            קראו בעיון את המסמכים, אשרו שהבנתם, וחתמו למטה
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <span className="text-body-small text-blue-700 font-medium">
              יש לקרוא כל מסמך עד הסוף לפני אישור
            </span>
          </div>
        </div>
      </SlideInView>

      {/* Document Review Cards */}
      <div className="space-y-6 mb-8">
        <SlideInView direction="up" delay={100}>
          <DocumentReviewCard
            documentNumber={1}
            title="ייפוי כוח לייצוג משפטי"
            content={powerOfAttorney}
            isReviewed={doc1Reviewed}
            onReviewChange={setDoc1Reviewed}
          />
        </SlideInView>

        <SlideInView direction="up" delay={200}>
          <DocumentReviewCard
            documentNumber={2}
            title="טופס 3 - הרצאת פרטים"
            content={form3}
            isReviewed={doc2Reviewed}
            onReviewChange={setDoc2Reviewed}
          />
        </SlideInView>
      </div>

      {/* Signature Section */}
      <SlideInView direction="up" delay={300}>
        <div
          className={cn(
            "bg-white rounded-xl border-2 p-8 transition-all duration-300",
            doc1Reviewed && doc2Reviewed
              ? "border-primary shadow-lg"
              : "border-neutral-light opacity-60"
          )}
        >
          <div className="mb-6">
            <h2 className="text-h2 font-semibold mb-2">החתימה שלכם</h2>
            <p className="text-body text-neutral-dark">
              חתימתכם תופיע על שני המסמכים שקראתם למעלה
            </p>
          </div>

          {/* Signature disabled notice */}
          {(!doc1Reviewed || !doc2Reviewed) && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-body font-medium text-amber-800">
                יש לקרוא ולאשר את כל המסמכים לפני החתימה
              </p>
              <p className="text-body-small text-amber-700 mt-1">
                {!doc1Reviewed && "✗ ייפוי כוח לא נקרא"}
                {!doc1Reviewed && !doc2Reviewed && " • "}
                {!doc2Reviewed && "✗ טופס 3 לא נקרא"}
              </p>
            </div>
          )}

          {/* Signature Pad */}
          <div className={cn(!doc1Reviewed || !doc2Reviewed ? "pointer-events-none" : "")}>
            <SignaturePad value={signature} onChange={handleSignatureChange} />
          </div>
        </div>
      </SlideInView>

      {/* Final validation notice */}
      {!canProceed && (
        <SlideInView direction="up" delay={400}>
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-body font-semibold text-red-700 mb-2">
              לפני שתמשיכו, ודאו ש:
            </p>
            <ul className="space-y-1 text-body-small text-red-600">
              {!doc1Reviewed && <li>✗ קראתם ואישרתם את ייפוי הכוח</li>}
              {!doc2Reviewed && <li>✗ קראתם ואישרתם את טופס 3</li>}
              {!signature && <li>✗ חתמתם על המסמכים</li>}
            </ul>
          </div>
        </SlideInView>
      )}

      {/* Navigation */}
      <SlideInView direction="up" delay={500}>
        <div className="flex justify-between mt-8">
          <Button type="button" variant="outline" size="lg" onClick={handleBack}>
            חזור
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleNext}
            disabled={!canProceed}
          >
            המשך לתשלום
          </Button>
        </div>
      </SlideInView>
    </div>
  );
}

// Helper for cn utility (in case it's not imported from utils)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
