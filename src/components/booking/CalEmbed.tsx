"use client";
import { useEffect } from "react";

export function CalEmbed({ calLink }: { calLink: string }) {
  useEffect(() => {
    (async function () {
      const { getCalApi } = await import("@calcom/embed-react");
      const cal = await getCalApi({});
      cal("ui", {
        styles: { branding: { brandColor: "#E81C74" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <button
      data-cal-link={calLink}
      data-cal-namespace={calLink}
      data-cal-config='{"layout":"month_view"}'
      className="w-full bg-[#E81C74] hover:bg-pink-600 text-white py-3 px-6 rounded-full font-bold transition-colors shadow-md"
    >
      Book a Session
    </button>
  );
}
