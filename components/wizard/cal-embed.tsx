"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect, useState } from "react";

export interface BookingData {
  eventId?: string;
  startTime?: string;
  endTime?: string;
  title?: string;
  attendees?: Array<{ email: string; name: string }>;
}

// Cal.com booking success event data structure
interface CalBookingSuccessData {
  booking: unknown;
  eventType: unknown;
  date: string;
  duration: number | undefined;
  organizer: { name: string; email: string; timeZone: string };
  confirmed: boolean;
}

interface CalEmbedProps {
  /** Cal.com event link (e.g., "username/event-type") */
  calLink: string;
  /** Callback when booking is successful */
  onBookingSuccess: (data: BookingData) => void;
  /** Pre-fill guest name */
  name?: string;
  /** Pre-fill guest email */
  email?: string;
  /** Pre-fill guest phone */
  phone?: string;
}

export function CalEmbed({
  calLink,
  onBookingSuccess,
  name,
  email,
  phone,
}: CalEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const cal = await getCalApi();

      // Listen for booking success
      cal("on", {
        action: "bookingSuccessful",
        callback: (e) => {
          const calData = e.detail.data as CalBookingSuccessData;
          console.log("Booking successful:", calData);

          // Transform Cal.com data to our BookingData format
          const bookingData: BookingData = {
            startTime: calData.date,
          };

          onBookingSuccess(bookingData);
        },
      });

      // Listen for when embed is ready
      cal("on", {
        action: "linkReady",
        callback: () => {
          setIsLoading(false);
        },
      });
    })();
  }, [onBookingSuccess]);

  // Build prefill config
  const prefillConfig: Record<string, string> = {};
  if (name) prefillConfig.name = name;
  if (email) prefillConfig.email = email;
  if (phone) prefillConfig.smsReminderNumber = phone;

  return (
    <div className="relative w-full min-h-[600px]">
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-body text-neutral-dark">טוען לוח זמנים...</p>
          </div>
        </div>
      )}

      {/* Cal.com inline embed */}
      <Cal
        calLink={calLink}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "600px",
          overflow: "scroll",
        }}
        config={{
          layout: "month_view",
          theme: "light",
          // Pre-fill user data if available
          ...prefillConfig,
        }}
      />
    </div>
  );
}
