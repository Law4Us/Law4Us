"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Download, Printer, Home } from "lucide-react";
import { Button } from "@/components/ui";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { CLAIMS } from "@/lib/constants/claims";
import {
  fillDocumentTemplate,
  generateChildrenBlock,
  formatClaimTypesList,
  POWER_OF_ATTORNEY_TEMPLATE,
  FORM_3_TEMPLATE,
  type DocumentData,
} from "@/lib/constants/document-templates";
import { formatDate } from "@/lib/utils/format";

type SubmissionState = "idle" | "submitting" | "success" | "error";

export default function Step5FinalSubmission() {
  const router = useRouter();
  const {
    basicInfo,
    selectedClaims,
    formData,
    signature,
    paymentData,
    reset,
    prevStep,
  } = useWizardStore();

  const [submissionState, setSubmissionState] =
    React.useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [retryCount, setRetryCount] = React.useState(0);

  // Prepare filled documents
  const filledDocuments = React.useMemo(() => {
    const children = formData.children || [];
    const claimLabels: { [key: string]: string } = {};
    CLAIMS.forEach((claim) => {
      claimLabels[claim.key] = claim.label;
    });

    const documentData: DocumentData = {
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
      signature: signature || "",
      date: formatDate(new Date()),
    };

    return {
      powerOfAttorney: fillDocumentTemplate(
        POWER_OF_ATTORNEY_TEMPLATE,
        documentData
      ),
      form3: fillDocumentTemplate(FORM_3_TEMPLATE, documentData),
    };
  }, [basicInfo, selectedClaims, formData, signature]);

  const handleSubmit = async () => {
    setSubmissionState("submitting");
    setErrorMessage("");

    try {
      // Prepare data for submission
      const submissionData = {
        basicInfo,
        formData,
        selectedClaims,
        selectedClaimsLabels: selectedClaims.map(
          (key) => CLAIMS.find((c) => c.key === key)?.label || key
        ),
        signature,
        paymentData,
        filledDocuments,
        submittedAt: new Date().toISOString(),
      };

      // Submit to API
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error(`שגיאת שרת: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSubmissionState("success");
        // Clear localStorage after successful submission
        setTimeout(() => {
          localStorage.removeItem("law4us-wizard-v1");
          reset();
        }, 2000);
      } else {
        throw new Error(result.error || "שגיאה בשליחת הטופס");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmissionState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "שגיאה לא צפויה. אנא נסו שנית."
      );
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    handleSubmit();
  };

  const handleBack = () => {
    prevStep();
    router.push("/wizard/step-4");
  };

  const handleDownloadDocument = (docName: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Idle state - ready to submit
  if (submissionState === "idle") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-h1 font-bold mb-2">סיכום ושליחה</h1>
          <p className="text-body text-neutral-dark">
            בדקו את המסמכים ושלחו את התביעה
          </p>
        </div>

        {/* Document previews */}
        <div className="space-y-6 mb-8">
          {/* Power of Attorney */}
          <div className="bg-white rounded-lg p-6 border border-neutral">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-h3 font-semibold">ייפוי כוח לייצוג משפטי</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownloadDocument(
                      "ייפוי-כוח",
                      filledDocuments.powerOfAttorney
                    )
                  }
                >
                  <Download className="w-4 h-4 ml-1" />
                  הורד
                </Button>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-assistant text-body-small leading-relaxed text-neutral-dark">
                {filledDocuments.powerOfAttorney}
              </pre>
            </div>
          </div>

          {/* Form 3 */}
          <div className="bg-white rounded-lg p-6 border border-neutral">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-h3 font-semibold">טופס 3 - הרצאת פרטים</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownloadDocument("טופס-3", filledDocuments.form3)
                  }
                >
                  <Download className="w-4 h-4 ml-1" />
                  הורד
                </Button>
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-assistant text-body-small leading-relaxed text-neutral-dark">
                {filledDocuments.form3}
              </pre>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-neutral-lightest rounded-lg p-6 mb-6">
          <div className="flex gap-3 justify-center mb-4">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 ml-1" />
              הדפס הכל
            </Button>
          </div>
        </div>

        {/* Submit button */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
          <h3 className="text-h3 font-semibold text-neutral-darkest mb-2">
            מוכנים לשליחה?
          </h3>
          <p className="text-body text-neutral-dark mb-4">
            לחיצה על "שלח תביעה" תעביר את כל המידע למשרד עו"ד אריאל דרור. נציג
            יצור קשר בתוך 24 שעות.
          </p>
          <Button onClick={handleSubmit} size="lg" className="w-full">
            שלח תביעה
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleBack}>
            חזור
          </Button>
        </div>
      </div>
    );
  }

  // Submitting state
  if (submissionState === "submitting") {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-6">
          <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className="text-h1 font-bold mb-2">שולח את התביעה...</h1>
        <p className="text-body text-neutral-dark">
          אנא המתינו, זה עשוי לקחת מספר שניות
        </p>
      </div>
    );
  }

  // Success state
  if (submissionState === "success") {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
        </div>
        <h1 className="text-h1 font-bold mb-4 text-green-800">
          התביעה נשלחה בהצלחה!
        </h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <p className="text-body text-green-800 mb-3">
            <strong>מה הלאה?</strong>
          </p>
          <ul className="text-body text-green-700 space-y-2 text-right">
            <li>✓ קיבלתם אישור בדוא"ל עם סיכום הפרטים</li>
            <li>✓ נציג מהמשרד יצור קשר בתוך 24 שעות</li>
            <li>✓ נקבע פגישת זום לבירור פרטים נוספים</li>
            <li>✓ התביעה תוגש לבית המשפט תוך 3-5 ימי עסקים</li>
          </ul>
        </div>
        <Button
          size="lg"
          onClick={() => {
            router.push("/");
          }}
        >
          <Home className="w-5 h-5 ml-2" />
          חזרה לדף הבית
        </Button>
      </div>
    );
  }

  // Error state
  if (submissionState === "error") {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>
        <h1 className="text-h1 font-bold mb-4 text-red-800">
          שגיאה בשליחת התביעה
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <p className="text-body text-red-800 mb-2">
            <strong>פרטי השגיאה:</strong>
          </p>
          <p className="text-body text-red-700">{errorMessage}</p>
          {retryCount > 0 && (
            <p className="text-body-small text-red-600 mt-2">
              ניסיונות: {retryCount}
            </p>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={handleRetry} size="lg">
            נסה שנית
          </Button>
          <Button variant="outline" size="lg" onClick={handleBack}>
            חזור לשלב הקודם
          </Button>
        </div>
        <p className="text-body-small text-neutral-dark mt-6">
          אם הבעיה נמשכת, אנא צרו קשר עם התמיכה:{" "}
          <a href="tel:0545882736" className="text-primary hover:underline">
            054-588-2736
          </a>
        </p>
      </div>
    );
  }

  return null;
}
