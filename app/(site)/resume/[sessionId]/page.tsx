"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { WizardSession } from "@/lib/services/wizard-session-service";

type SessionStatus = 'loading' | 'found' | 'expired' | 'not_found' | 'error';

export default function ResumeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [status, setStatus] = React.useState<SessionStatus>('loading');
  const [session, setSession] = React.useState<WizardSession | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const wizardStore = useWizardStore();

  // Fetch session on mount
  React.useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setStatus('error');
        setErrorMessage('Session ID is missing');
        return;
      }

      try {
        console.log('🔍 Fetching session:', sessionId);

        const response = await fetch(`/api/sessions/${sessionId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setSession(data.session);
          setStatus('found');
          console.log('✅ Session found:', data.session);
        } else if (response.status === 410) {
          // Session expired
          setStatus('expired');
          setErrorMessage('הסשן פג תוקף');
        } else if (response.status === 404) {
          setStatus('not_found');
          setErrorMessage('הסשן לא נמצא');
        } else {
          setStatus('error');
          setErrorMessage(data.message || 'שגיאה בטעינת הסשן');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setStatus('error');
        setErrorMessage('שגיאה בחיבור לשרת');
      }
    };

    fetchSession();
  }, [sessionId]);

  // Restore wizard state from session
  const handleRestore = React.useCallback(() => {
    if (!session) return;

    console.log('📝 Restoring wizard state from session...');

    // Restore all wizard data
    wizardStore.setSessionId(session.sessionId);

    if (session.wizardData.selectedClaims) {
      wizardStore.setSelectedClaims(session.wizardData.selectedClaims as any);
    }

    if (session.wizardData.basicInfo) {
      wizardStore.updateBasicInfo(session.wizardData.basicInfo);
    }

    if (session.wizardData.formData) {
      wizardStore.updateFormData(session.wizardData.formData);
    }

    if (session.wizardData.signature) {
      wizardStore.setSignature(session.wizardData.signature);
    }

    if (session.wizardData.paymentData) {
      wizardStore.setPaymentData(session.wizardData.paymentData);
    }

    // Navigate to appropriate step based on session status
    if (session.paymentStatus === 'paid' && session.submissionStatus === 'pending') {
      // Paid but not submitted - go to final step
      console.log('💰 Payment confirmed - redirecting to submission step');
      wizardStore.setStep(4); // Step 5 (index 4)
      router.push('/wizard/step-5');
    } else if (session.paymentStatus === 'pending') {
      // Not paid yet - go to payment step
      console.log('💳 Resuming at payment step');
      wizardStore.setStep(3); // Step 4 (index 3)
      router.push('/wizard/step-4');
    } else if (session.submissionStatus === 'submitted') {
      // Already submitted - show confirmation
      console.log('✅ Already submitted');
      wizardStore.setStep(4); // Step 5 (index 4)
      router.push('/wizard/step-5');
    }

    console.log('✅ Wizard state restored successfully');
  }, [session, wizardStore, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <h1 className="text-h3 font-bold mb-2">טוען את הבקשה שלך...</h1>
          <p className="text-body text-neutral-dark">אנא המתן</p>
        </div>
      </div>
    );
  }

  // Session found - show restore UI
  if (status === 'found' && session) {
    const isPaid = session.paymentStatus === 'paid';
    const isSubmitted = session.submissionStatus === 'submitted';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
          </div>

          {/* Title */}
          <h1 className="text-h2 font-bold mb-4">
            {isSubmitted ? 'הבקשה כבר נשלחה!' : 'מצאנו את הבקשה שלך!'}
          </h1>

          {/* Session Details */}
          <div className="bg-neutral-light rounded-lg p-6 mb-6 text-right">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-body-small text-neutral-dark">מספר סשן:</span>
                <span className="font-mono text-body-small bg-white px-3 py-1 rounded">
                  {session.sessionId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-body-small text-neutral-dark">אימייל:</span>
                <span className="text-body-small">{session.email}</span>
              </div>

              {session.fullName && (
                <div className="flex justify-between items-center">
                  <span className="text-body-small text-neutral-dark">שם:</span>
                  <span className="text-body-small">{session.fullName}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-body-small text-neutral-dark">תביעות שנבחרו:</span>
                <span className="text-body-small">
                  {session.wizardData.selectedClaims?.length || 0}
                </span>
              </div>

              {session.totalAmount && (
                <div className="flex justify-between items-center">
                  <span className="text-body-small text-neutral-dark">סכום כולל:</span>
                  <span className="text-body-small font-bold">
                    ₪{session.totalAmount.toLocaleString('he-IL')}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-neutral">
                <span className="text-body-small text-neutral-dark">סטטוס תשלום:</span>
                <span className={`text-body-small font-bold ${isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                  {isPaid ? '✅ שולם' : '⏳ ממתין לתשלום'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-body-small text-neutral-dark">סטטוס שליחה:</span>
                <span className={`text-body-small font-bold ${isSubmitted ? 'text-green-600' : 'text-blue-600'}`}>
                  {isSubmitted ? '✅ נשלח' : '📝 ממתין לשליחה'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-body-small text-neutral-dark">תאריך יצירה:</span>
                <span className="text-body-small">
                  {new Date(session.createdAt).toLocaleDateString('he-IL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action message */}
          <div className="mb-6">
            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-body text-green-800">
                  הבקשה שלך כבר נשלחה בהצלחה!
                  <br />
                  קיבלת מייל עם המסמכים המשפטיים.
                </p>
              </div>
            ) : isPaid ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-body text-blue-800">
                  <strong>נהדר! התשלום שלך התקבל.</strong>
                  <br />
                  נשאר לך רק צעד אחד - להשלים את השליחה.
                </p>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-body text-orange-800">
                  תוכל להמשיך מהמקום שבו עצרת.
                  <br />
                  כל המידע שהזנת נשמר בבטחה.
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-center">
            {!isSubmitted && (
              <Button
                onClick={handleRestore}
                size="lg"
                className="min-w-[200px]"
              >
                {isPaid ? 'להשלמת השליחה' : 'המשך לתשלום'}
              </Button>
            )}

            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
            >
              חזרה לדף הבית
            </Button>
          </div>

          {/* Help text */}
          <p className="text-body-small text-neutral-dark mt-6">
            יש בעיה? צור קשר עם התמיכה שלנו במייל{' '}
            <a href="mailto:info@law-4-us.co.il" className="text-primary underline">
              info@law-4-us.co.il
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Error states
  const errorConfig = {
    expired: {
      icon: Clock,
      title: 'הסשן פג תוקף',
      message: 'הקישור שלך פג תוקף (30 ימים). תצטרך להתחיל את התהליך מחדש.',
      color: 'text-orange-500',
    },
    not_found: {
      icon: AlertCircle,
      title: 'הסשן לא נמצא',
      message: 'לא מצאנו את הבקשה שלך. ייתכן שהקישור שגוי או שהבקשה נמחקה.',
      color: 'text-yellow-500',
    },
    error: {
      icon: XCircle,
      title: 'אירעה שגיאה',
      message: errorMessage || 'משהו השתבש. נא לנסות שוב מאוחר יותר.',
      color: 'text-red-500',
    },
  };

  const config = errorConfig[status as keyof typeof errorConfig] || errorConfig.error;
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-light to-white p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <Icon className={`w-16 h-16 mx-auto ${config.color}`} />
        </div>

        {/* Error Title */}
        <h1 className="text-h2 font-bold mb-4">{config.title}</h1>

        {/* Error Message */}
        <p className="text-body text-neutral-dark mb-6">{config.message}</p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => router.push('/wizard')}
            size="lg"
          >
            התחל תהליך חדש
          </Button>

          <Button
            onClick={() => router.push('/contact')}
            variant="outline"
            size="lg"
          >
            צור קשר
          </Button>
        </div>

        {/* Session ID for support */}
        {sessionId && (
          <p className="text-body-small text-neutral-dark mt-6">
            מספר סשן: <span className="font-mono">{sessionId}</span>
          </p>
        )}
      </div>
    </div>
  );
}
