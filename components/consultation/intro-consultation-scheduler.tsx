"use client";

import { CalEmbed } from "@/components/wizard/cal-embed";

interface IntroConsultationSchedulerProps {
  calLink: string;
}

function handleIntroBookingSuccess() {
  // The introductory booking completes in Cal.com; there is no wizard step to advance.
}

export function IntroConsultationScheduler({ calLink }: IntroConsultationSchedulerProps) {
  return <CalEmbed calLink={calLink} onBookingSuccess={handleIntroBookingSuccess} />;
}
