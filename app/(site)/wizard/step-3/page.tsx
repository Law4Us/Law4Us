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

  // Check if should show Form 3 (only if claim includes non-alimony types)
  const shouldShowForm3 = React.useMemo(() => {
    // Show Form 3 if there's ANY claim OTHER than alimony
    return selectedClaims.some(claim => claim !== 'alimony');
  }, [selectedClaims]);

  // Prepare document data
  const documentData: DocumentData = React.useMemo(() => {
    const children = formData.children || [];
    const claimLabels: { [key: string]: string } = {};
    CLAIMS.forEach((claim) => {
      claimLabels[claim.key] = claim.label;
    });

    // Helper to format yes/no
    const yesNo = (val: any) => {
      if (val === 'yes' || val === 'כן' || val === true) return 'כן';
      if (val === 'no' || val === 'לא' || val === false) return 'לא';
      return 'לא צוין';
    };

    // Convert signature to HTML img tag if signature exists
    const signatureHTML = signature
      ? `<img src="${signature}" alt="חתימה" style="width: 250px; height: 125px; display: block; margin: 10px 0;" />`
      : "[חתימה תתווסף לאחר החתימה]";

    // Split full names into first and last
    const nameParts = (basicInfo.fullName || "").split(" ");
    const firstName = nameParts.slice(0, -1).join(" ") || basicInfo.fullName || "";
    const lastName = nameParts.slice(-1)[0] || basicInfo.fullName || "";

    const nameParts2 = (basicInfo.fullName2 || "").split(" ");
    const firstName2 = nameParts2.slice(0, -1).join(" ") || basicInfo.fullName2 || "";
    const lastName2 = nameParts2.slice(-1)[0] || basicInfo.fullName2 || "";

    // Determine applicant title based on gender
    const applicantTitle = basicInfo.gender === 'male' ? 'התובע' : 'התובעת';

    // Format children block for Form 3
    const childrenBlock = children.length > 0
      ? children.map((child: any, i: number) =>
          `${i + 1}. שם: ${child.firstName || ''} ${child.lastName || ''}\n   תאריך לידה: ${child.birthDate || 'לא צוין'}\n   שם ההורה (שאינו המבקש): לא צוין\n   מקום מגורי הילד: ${child.address || 'לא צוין'}`
        ).join('\n\n')
      : 'אין ילדים';

    return {
      fullName: basicInfo.fullName || "",
      firstName,
      lastName,
      idNumber: basicInfo.idNumber || "",
      address: basicInfo.address || "",
      phone: basicInfo.phone || "",
      email: basicInfo.email || "",
      birthDate: basicInfo.birthDate || "",
      fullName2: basicInfo.fullName2 || "",
      firstName2,
      lastName2,
      idNumber2: basicInfo.idNumber2 || "",
      address2: basicInfo.address2 || "",
      phone2: basicInfo.phone2 || "",
      email2: basicInfo.email2 || "",
      birthDate2: basicInfo.birthDate2 || "",
      relationshipType: basicInfo.relationshipType || "",
      weddingDay: basicInfo.weddingDay || "",
      claimTypes: formatClaimTypesList(selectedClaims, claimLabels),
      childrenBlock,
      lawyerName: "עו\"ד אריאל דרור",
      signature: signatureHTML,
      date: formatDate(new Date()),
      applicantTitle,
      previousMarriages: yesNo(formData.marriedBefore),
      childrenFromPrevious: yesNo(formData.hadChildrenFromPrevious),
      applicantHomeType: formData.applicantHomeType || 'לא צוין',
      partnerHomeType: formData.partnerHomeType || 'לא צוין',
      protectionOrder: yesNo(formData.protectionOrderRequested),
      pastViolence: yesNo(formData.pastViolenceReported),
      otherCases: formData.otherFamilyCases?.length > 0 ? 'קיימים תיקים אחרים' : 'אין תיקים אחרים',
      contactedWelfare: yesNo(formData.contactedWelfare),
      contactedMarriageCounseling: yesNo(formData.contactedMarriageCounseling),
      contactedFamilyCounseling: yesNo(formData.contactedFamilyCounseling),
      contactedMediation: yesNo(formData.contactedMediation),
      willingFamilyCounseling: yesNo(formData.willingToJoinFamilyCounseling),
      willingMediation: yesNo(formData.willingToJoinMediation),
    } as any;
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

  // Check if can proceed - doc2 only required if Form 3 is shown
  const canProceed = shouldShowForm3
    ? (doc1Reviewed && doc2Reviewed && signature)
    : (doc1Reviewed && signature);

  const handleNext = () => {
    if (!doc1Reviewed || (shouldShowForm3 && !doc2Reviewed)) {
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
            renderAsHTML={true}
          />
        </SlideInView>

        {shouldShowForm3 && (
          <SlideInView direction="up" delay={200}>
            <DocumentReviewCard
              documentNumber={2}
              title="טופס 3 - הרצאת פרטים"
              content={form3}
              isReviewed={doc2Reviewed}
              onReviewChange={setDoc2Reviewed}
              renderAsHTML={true}
            />
          </SlideInView>
        )}
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
              {shouldShowForm3
                ? "חתימתכם תופיע על שני המסמכים שקראתם למעלה"
                : "חתימתכם תופיע על ייפוי הכוח שקראתם למעלה"}
            </p>
          </div>

          {/* Signature disabled notice */}
          {(!doc1Reviewed || (shouldShowForm3 && !doc2Reviewed)) && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-body font-medium text-amber-800">
                יש לקרוא ולאשר את כל המסמכים לפני החתימה
              </p>
              <p className="text-body-small text-amber-700 mt-1">
                {!doc1Reviewed && "✗ ייפוי כוח לא נקרא"}
                {!doc1Reviewed && shouldShowForm3 && !doc2Reviewed && " • "}
                {shouldShowForm3 && !doc2Reviewed && "✗ טופס 3 לא נקרא"}
              </p>
            </div>
          )}

          {/* Signature Pad */}
          <div className={cn(!doc1Reviewed || (shouldShowForm3 && !doc2Reviewed) ? "pointer-events-none" : "")}>
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
              {shouldShowForm3 && !doc2Reviewed && <li>✗ קראתם ואישרתם את טופס 3</li>}
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
