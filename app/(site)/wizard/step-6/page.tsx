"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Home, Mail, Phone, Calendar, Video } from "lucide-react";
import { Button } from "@/components/ui";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { CLAIMS } from "@/lib/constants/claims";
import { SuccessAnimation } from "@/components/wizard/success-animation";
import { Timeline } from "@/components/wizard/timeline";
import { SlideInView } from "@/components/animations/slide-in-view";
import {
  fillDocumentTemplate,
  generateChildrenBlock,
  formatClaimTypesList,
  formatClaimServicesForFee,
  POWER_OF_ATTORNEY_TEMPLATE,
  FORM_3_TEMPLATE,
  type DocumentData,
} from "@/lib/constants/document-templates";
import { formatDate } from "@/lib/utils/format";
import { convertFormDataFiles, extractAttachmentsFromFormData } from "@/lib/utils/file-converter";
import { LEGAL_VERSION } from "@/lib/constants/legal";

type SubmissionState = "confirming" | "submitting" | "success" | "error";

export default function Step6Confirmation() {
  const router = useRouter();
  const {
    basicInfo,
    selectedClaims,
    formData,
    signature,
    paymentData,
    scheduledCallData,
    sessionId,
    reset,
  } = useWizardStore();

  const [submissionState, setSubmissionState] =
    React.useState<SubmissionState>("confirming");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [retryCount, setRetryCount] = React.useState(0);
  const [submissionConsentAccepted, setSubmissionConsentAccepted] = React.useState(false);

  // Prepare filled documents (for backend processing)
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
      powerOfAttorneyMatter: formatClaimServicesForFee(selectedClaims),
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
    if (!submissionConsentAccepted) {
      return;
    }

    setSubmissionState("submitting");
    setErrorMessage("");

    try {
      console.log("Starting submission...");

      // Convert all File objects to base64 before submission
      // Images are automatically compressed during this step
      const convertedFormData = await convertFormDataFiles(formData);

      // Extract attachments for document generation
      const attachments = extractAttachmentsFromFormData({
        ...convertedFormData,
        basicInfo,
      });

      console.log(`Attachments to submit: ${attachments.length}`);

      // Prepare data for submission
      const submissionData = {
        basicInfo,
        formData: convertedFormData,
        selectedClaims,
        selectedClaimsLabels: selectedClaims.map(
          (key) => CLAIMS.find((c) => c.key === key)?.label || key
        ),
        signature,
        paymentData,
        scheduledCallData,
        sessionId,
        filledDocuments,
        attachments: attachments.length > 0 ? attachments : undefined,
        consents: {
          legalVersion: LEGAL_VERSION,
          submittedAt: new Date().toISOString(),
          acceptedTerms: true,
          acceptedPrivacy: true,
          acceptedCancellationPolicy: true,
          confirmedInformationAccuracy: true,
        },
        submittedAt: new Date().toISOString(),
      };

      const payload = JSON.stringify(submissionData);
      const payloadSizeMB = (payload.length / (1024 * 1024)).toFixed(2);
      console.log(`Payload size: ${payloadSizeMB} MB`);

      // Warn if payload is large (Vercel limit is 4.5MB)
      if (payload.length > 4 * 1024 * 1024) {
        console.warn(`Large payload detected: ${payloadSizeMB} MB (limit is 4.5 MB)`);
      }

      // Submit to API
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });

      if (!response.ok) {
        // Handle 413 Payload Too Large specifically
        if (response.status === 413) {
          throw new Error(
            "הקבצים שהעליתם גדולים מדי. אנא הקטינו את גודל הקבצים או העלו פחות קבצים ונסו שוב."
          );
        }

        // Try to parse error response
        let errorMessage = "שגיאה בשליחת הטופס";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response isn't JSON, use status text
          errorMessage = `שגיאה ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Success
      setSubmissionState("success");
      console.log("Submission successful!");

      // Clear localStorage after successful submission
      setTimeout(() => {
        localStorage.removeItem("law4us-wizard-v1");
        reset();
      }, 2000);
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmissionState("error");
      setErrorMessage(error.message || "שגיאה לא ידועה");
      setRetryCount((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    handleSubmit();
  };

  // Get selected claim labels
  const selectedClaimLabels = selectedClaims
    .map((key) => CLAIMS.find((c) => c.key === key)?.label)
    .filter(Boolean);

  // Format scheduled call date
  const formatScheduledDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('he-IL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString('he-IL', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch {
      return null;
    }
  };

  const scheduledDateTime = formatScheduledDate(scheduledCallData?.scheduledTime);

  // Confirmation state - before submission
  if (submissionState === "confirming") {
    return (
      <div className="max-w-3xl mx-auto">
        <SlideInView direction="up" delay={0}>
          <div className="mb-8 text-center">
            <h1 className="text-h1 font-bold mb-2">סיכום ושליחה</h1>
            <p className="text-body text-neutral-dark">
              אנו מוכנים לשלוח את התביעה שלכם למשרד עו"ד אריאל דרור
            </p>
          </div>
        </SlideInView>

        {/* Scheduled Call Info */}
        {scheduledCallData?.scheduled && scheduledDateTime && (
          <SlideInView direction="up" delay={50}>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-h4 font-semibold text-green-800 mb-2">
                    שיחת הוידאו נקבעה
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-green-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">{scheduledDateTime.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕐</span>
                      <span className="font-medium">{scheduledDateTime.time}</span>
                    </div>
                  </div>
                  <p className="text-body-small text-green-600 mt-2">
                    קישור לשיחה יישלח אליכם במייל
                  </p>
                </div>
              </div>
            </div>
          </SlideInView>
        )}

        {/* Summary Card */}
        <SlideInView direction="up" delay={100}>
          <div className="bg-white rounded-xl border-2 border-primary/20 p-8 mb-6">
            <h2 className="text-h2 font-semibold mb-6 text-primary">פרטי התביעה</h2>

            {/* Client Info */}
            <div className="mb-6 pb-6 border-b border-neutral-light">
              <h3 className="text-h4 font-semibold mb-3">פרטי הלקוח</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-body-small text-neutral-dark">שם מלא</p>
                  <p className="text-body font-medium">{basicInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-body-small text-neutral-dark">דוא"ל</p>
                  <p className="text-body font-medium">{basicInfo.email}</p>
                </div>
                <div>
                  <p className="text-body-small text-neutral-dark">טלפון</p>
                  <p className="text-body font-medium">{basicInfo.phone}</p>
                </div>
              </div>
            </div>

            {/* Selected Claims */}
            <div>
              <h3 className="text-h4 font-semibold mb-3">תביעות שנבחרו</h3>
              <div className="flex flex-wrap gap-2">
                {selectedClaimLabels.map((label, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-body font-medium"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SlideInView>

        {/* Confirmation Notice */}
        <SlideInView direction="up" delay={200}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-h4 font-semibold text-blue-800 mb-2">
              לפני שליחת התביעה
            </h3>
            <ul className="space-y-2 text-body text-blue-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>המסמכים יופקו אוטומטית ויישלחו למשרד עו"ד</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>תקבלו אישור בדוא"ל עם סיכום הפרטים</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>שיחת הוידאו תתקיים במועד שנקבע לאימות זהות</span>
              </li>
            </ul>
          </div>
        </SlideInView>

        {/* Submit Button */}
        <SlideInView direction="up" delay={250}>
          <div className="flex flex-col items-center gap-2">
            <label className="mb-4 flex w-full items-start gap-3 rounded-lg border border-neutral-light bg-white p-4 text-right text-body-small text-neutral-dark">
              <input
                type="checkbox"
                checked={submissionConsentAccepted}
                onChange={(event) => setSubmissionConsentAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-light text-primary focus:ring-2 focus:ring-primary/20"
              />
              <span>
                אני מאשר/ת שהפרטים שמסרתי נכונים ומלאים לפי מיטב ידיעתי, ומסכים/ה לשליחת
                המידע והמסמכים למשרד לצורך טיפול בתיק בהתאם ל
                <Link href="/terms" className="text-primary hover:underline">תנאי השימוש</Link>
                , ל
                <Link href="/privacy" className="text-primary hover:underline">מדיניות הפרטיות</Link>
                {" "}ול
                <Link href="/cancellation-policy" className="text-primary hover:underline">מדיניות הביטולים וההחזרים</Link>
                .
              </span>
            </label>
            <Button
              onClick={handleSubmit}
              variant="primary"
              size="lg"
              disabled={!submissionConsentAccepted}
              className="w-full md:w-auto min-w-[300px]"
            >
              שלח תביעה
            </Button>
          </div>
        </SlideInView>
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
    const timelineItems = [
      {
        title: "אישור התקבל",
        description: "קיבלתם אישור בדוא\"ל עם סיכום מלא של הפרטים שהוגשו",
        status: "completed" as const,
      },
      ...(scheduledCallData?.scheduled ? [{
        title: "שיחת וידאו לאימות זהות",
        description: scheduledDateTime
          ? `${scheduledDateTime.date} בשעה ${scheduledDateTime.time} - קישור יישלח במייל`
          : "מועד השיחה נקבע - קישור יישלח במייל",
        status: "current" as const,
      }] : []),
      {
        title: "קבלת טפסים",
        description: "תקבלו את כל המסמכים והטפסים המוכנים להגשה בדוא\"ל",
        status: "upcoming" as const,
      },
      {
        title: "הגשה לבית המשפט",
        description: "המסמכים יוגשו לבית המשפט לענייני משפחה",
        status: "upcoming" as const,
      },
    ];

    return (
      <div className="max-w-4xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <SuccessAnimation size="xl" />
          <SlideInView direction="up" delay={400}>
            <h1 className="text-h1 font-bold mb-2 text-green-700 mt-6">
              התביעה נשלחה בהצלחה!
            </h1>
            <p className="text-body-large text-neutral-dark">
              תודה שבחרתם במשרד עו"ד אריאל דרור
            </p>
          </SlideInView>
        </div>

        {/* Email Confirmation */}
        <SlideInView direction="up" delay={500}>
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-h4 font-semibold text-green-800 mb-1">
                  אישור נשלח לדוא"ל
                </h3>
                <p className="text-body text-green-700 mb-2">
                  שלחנו אישור מפורט לכתובת: <strong>{basicInfo.email}</strong>
                </p>
                <p className="text-body-small text-green-600">
                  (אם לא רואים את המייל, בדקו בתיקיית הספאם)
                </p>
              </div>
            </div>
          </div>
        </SlideInView>

        {/* Scheduled Call Reminder */}
        {scheduledCallData?.scheduled && scheduledDateTime && (
          <SlideInView direction="up" delay={550}>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-h4 font-semibold text-blue-800 mb-2">
                    שיחת הוידאו שלכם נקבעה
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-blue-700 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span className="font-medium">{scheduledDateTime.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🕐</span>
                      <span className="font-medium">{scheduledDateTime.time}</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3 text-body-small text-blue-800">
                    <strong>מה להכין לשיחה:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• תעודת זהות</li>
                      <li>• מקום שקט ופרטי</li>
                      <li>• חיבור אינטרנט יציב</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </SlideInView>
        )}

        {/* Timeline - What's Next */}
        <SlideInView direction="up" delay={600}>
          <div className="bg-white rounded-xl border-2 border-neutral-light p-8 mb-8">
            <h2 className="text-h2 font-semibold mb-6 text-primary">
              מה קורה עכשיו?
            </h2>
            <Timeline items={timelineItems} />
          </div>
        </SlideInView>

        {/* Contact Information */}
        <SlideInView direction="up" delay={700}>
          <div className="bg-neutral-lightest rounded-xl p-6 mb-8">
            <h3 className="text-h3 font-semibold mb-4 text-center">
              יש שאלות? נשמח לעזור
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="tel:0507529938"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-neutral-light rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-medium">050-7529938</span>
              </a>
              <a
                href="mailto:info@law-4-us.co.il"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-neutral-light rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium">info@law-4-us.co.il</span>
              </a>
            </div>
          </div>
        </SlideInView>

        {/* Return Home Button */}
        <SlideInView direction="up" delay={800}>
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/")}
            >
              <Home className="w-5 h-5 ml-2" />
              חזרה לדף הבית
            </Button>
          </div>
        </SlideInView>
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
          <Button
            variant="outline"
            size="lg"
            onClick={() => setSubmissionState("confirming")}
          >
            חזור
          </Button>
        </div>
        <p className="text-body-small text-neutral-dark mt-6">
          אם הבעיה נמשכת, אנא צרו קשר עם התמיכה:{" "}
          <a href="tel:0507529938" className="text-primary hover:underline">
            050-7529938
          </a>
        </p>
      </div>
    );
  }

  return null;
}
