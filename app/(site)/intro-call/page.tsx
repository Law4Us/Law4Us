import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IntroConsultationScheduler } from "@/components/consultation/intro-consultation-scheduler";

export const metadata: Metadata = {
  title: "שיחת היכרות קצרה בזום | Law4Us",
  description: "קובעים שיחת היכרות קצרה עם עורך דין לפני שמחליטים אם להמשיך לשאלון.",
};

const introConsultationCalLink =
  process.env.NEXT_PUBLIC_INITIAL_CONSULTATION_CAL_LINK || "law4us/advice";
const introConsultationCalUrl = `https://cal.com/${introConsultationCalLink}`;

export default function IntroCallPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <div className="mb-8 text-center">
        <p className="mb-3 text-body-small font-semibold text-primary">ללא התחייבות למילוי שאלון</p>
        <h1 className="mb-4 text-h1 font-bold text-neutral-darkest">
          שיחת היכרות קצרה בזום
        </h1>
        <p className="mx-auto max-w-2xl text-body-large text-neutral-dark">
          רוצים להבין את התהליך לפני שמתחילים? קבעו מועד נוח לשיחה קצרה עם עורך הדין.
          מי שמעדיף יכול להמשיך ישירות לשאלון.
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <Link href="/wizard" className="inline-flex items-center gap-2 text-body font-semibold text-primary hover:underline">
          להמשך ישיר לשאלון
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-light bg-white p-2 shadow-sm sm:p-5">
        <IntroConsultationScheduler calLink={introConsultationCalLink} />
      </div>

      <p className="mt-5 text-center text-body-small text-neutral-dark">
        לוח הזמנים לא נטען?{" "}
        <a
          href={introConsultationCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          פתחו את לוח הזמנים ישירות ב-Cal.com
        </a>
      </p>
    </div>
  );
}
