"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Video, ChevronDown, ChevronUp, Check, Shield, Clock, User } from "lucide-react";
import { Button } from "@/components/ui";
import { SlideInView } from "@/components/animations/slide-in-view";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { CalEmbed, type BookingData } from "@/components/wizard/cal-embed";

// Cal.com link - should be set via environment variable
const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK || "law4us/video-verification";
type PaymentAccessStatus = "checking" | "verified";

export default function Step5Scheduling() {
  const router = useRouter();
  const {
    basicInfo,
    sessionId,
    scheduledCallData,
    setScheduledCallData,
    nextStep,
  } = useWizardStore();

  const [infoExpanded, setInfoExpanded] = React.useState(false);
  const [isScheduled, setIsScheduled] = React.useState(!!scheduledCallData?.scheduled);
  const [paymentAccessStatus, setPaymentAccessStatus] = React.useState<PaymentAccessStatus>("checking");

  React.useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      if (!sessionId) {
        router.replace("/wizard/step-4");
        return;
      }

      try {
        const response = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (response.ok && data.success && data.session?.paymentStatus === "paid") {
          setPaymentAccessStatus("verified");
          return;
        }
      } catch (error) {
        console.warn("Could not verify payment before scheduling:", error);
      }

      router.replace("/wizard/step-4");
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [router, sessionId]);

  // Handle successful booking
  const handleBookingSuccess = React.useCallback((data: BookingData) => {
    console.log("Booking confirmed:", data);

    // Save booking data to store
    setScheduledCallData({
      scheduled: true,
      eventId: data.eventId,
      scheduledTime: data.startTime,
    });

    setIsScheduled(true);

    // Auto-proceed to next step after short delay
    setTimeout(() => {
      nextStep();
      router.push("/wizard/step-6");
    }, 2000);
  }, [setScheduledCallData, nextStep, router]);

  if (paymentAccessStatus !== "verified") {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-2xl items-center justify-center px-6 py-16 text-center">
        <p className="text-body-large text-neutral-dark">בודקים את אישור התשלום...</p>
      </div>
    );
  }

  // If already scheduled, show confirmation and proceed button
  if (isScheduled && scheduledCallData?.scheduled) {
    const scheduledDate = scheduledCallData.scheduledTime
      ? new Date(scheduledCallData.scheduledTime)
      : null;

    return (
      <div className="max-w-3xl mx-auto">
        <SlideInView direction="up" delay={0}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
            </div>
            <h1 className="text-h1 font-bold mb-2 text-green-700">
              שיחת הוידאו נקבעה בהצלחה!
            </h1>
            {scheduledDate && (
              <p className="text-body-large text-neutral-dark">
                {scheduledDate.toLocaleDateString('he-IL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {' בשעה '}
                {scheduledDate.toLocaleTimeString('he-IL', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </SlideInView>

        <SlideInView direction="up" delay={100}>
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <h3 className="text-h4 font-semibold text-green-800 mb-3">
              קישור לשיחה יישלח אליכם במייל
            </h3>
            <p className="text-body text-green-700">
              שלחנו לכם אישור לכתובת <strong>{basicInfo.email}</strong> עם כל הפרטים.
            </p>
          </div>
        </SlideInView>

        <SlideInView direction="up" delay={200}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-h4 font-semibold text-blue-800 mb-3">
              מה להכין לשיחה?
            </h3>
            <ul className="space-y-2 text-body text-blue-700">
              <li className="flex items-start gap-2">
                <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>תעודת זהות (להצגה במצלמה)</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>מקום שקט ופרטי</span>
              </li>
              <li className="flex items-start gap-2">
                <Video className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>מצלמה ומיקרופון תקינים</span>
              </li>
            </ul>
          </div>
        </SlideInView>

        <SlideInView direction="up" delay={300}>
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => {
                nextStep();
                router.push("/wizard/step-6");
              }}
              className="min-w-[300px]"
            >
              המשך לסיום
            </Button>
          </div>
        </SlideInView>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <SlideInView direction="up" delay={0}>
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-h1 font-bold mb-2">שיחת וידאו קצרה לאימות זהות</h1>
          <p className="text-body text-neutral-dark max-w-2xl mx-auto">
            כחלק מהתהליך המשפטי, נקבע שיחת וידאו קצרה עם עורך דין לאימות זהותך
          </p>
        </div>
      </SlideInView>

      {/* Expandable Legal Info */}
      <SlideInView direction="up" delay={50}>
        <div className="bg-neutral-lightest rounded-xl border border-neutral-light mb-6">
          <button
            type="button"
            onClick={() => setInfoExpanded(!infoExpanded)}
            className="w-full flex items-center justify-between p-4 text-right"
          >
            <span className="text-body font-medium text-neutral-dark">
              למידע נוסף על התהליך
            </span>
            {infoExpanded ? (
              <ChevronUp className="w-5 h-5 text-neutral-dark" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-dark" />
            )}
          </button>

          {infoExpanded && (
            <div className="px-4 pb-4 pt-0">
              <div className="bg-white rounded-lg p-4 border border-neutral-light">
                <p className="text-body text-neutral-dark mb-3">
                  בהתאם להחלטות ועדת האתיקה של לשכת עורכי הדין, ניתן לחתום על תצהיר
                  באמצעות היוועדות חזותית (שיחת וידאו). בשיחה:
                </p>
                <ul className="space-y-2 text-body text-neutral-dark">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>תזדהה באמצעות תעודה מזהה</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>עורך הדין יקריא את האזהרה הנדרשת על פי חוק</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>השיחה תוקלט לצורכי תיעוד (בהסכמתך)</span>
                  </li>
                </ul>
                <p className="text-body-small text-neutral-dark mt-3 pt-3 border-t border-neutral-light">
                  תהליך זה מחליף את הצורך בהגעה פיזית למשרד עורך הדין, וחוסך לכם זמן ומאמץ.
                </p>
              </div>
            </div>
          )}
        </div>
      </SlideInView>

      {/* Quick info cards */}
      <SlideInView direction="up" delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-neutral-light p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-body font-semibold text-neutral-darkest">15-20 דקות</p>
              <p className="text-body-small text-neutral-dark">משך השיחה</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-light p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-body font-semibold text-neutral-darkest">זום / גוגל מיט</p>
              <p className="text-body-small text-neutral-dark">פלטפורמת השיחה</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-light p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-body font-semibold text-neutral-darkest">תעודת זהות</p>
              <p className="text-body-small text-neutral-dark">יש להכין</p>
            </div>
          </div>
        </div>
      </SlideInView>

      {/* Cal.com Embed */}
      <SlideInView direction="up" delay={150}>
        <div className="bg-white rounded-xl border-2 border-primary/20 shadow-md overflow-hidden">
          <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
            <h2 className="text-h3 font-semibold text-primary">
              בחרו מועד נוח עבורכם
            </h2>
          </div>
          <div className="p-0">
            <CalEmbed
              calLink={CAL_LINK}
              onBookingSuccess={handleBookingSuccess}
              name={basicInfo.fullName}
              email={basicInfo.email}
              phone={basicInfo.phone}
            />
          </div>
        </div>
      </SlideInView>
    </div>
  );
}
