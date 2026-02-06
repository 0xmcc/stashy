"use client";

import { useState } from "react";
import { useView } from "../contexts/ViewContext";

interface UpgradeBannerProps {
  onLearnMore?: () => void;
}

export default function UpgradeBanner({ onLearnMore }: UpgradeBannerProps) {
  const { view } = useView();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isFacebook = view === "facebook";
  const accentColor = isFacebook ? "rgb(66,133,244)" : "rgb(29,155,240)";

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setLoading(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  };

  if (dismissed) return null;

  return (
    <div
      className="relative mx-3 my-4 rounded-xl border p-4 sm:p-5"
      style={{
        borderColor: accentColor,
        background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(30,30,30,0.9) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-[rgb(113,118,123)] hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <svg className="w-5 h-5" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-[15px]">
            Unlock the full archive, AI summaries, and learning paths
          </p>
          <p className="text-[rgb(113,118,123)] text-sm mt-0.5">
            Get more from your saved content with Pro features.{" "}
            {onLearnMore && (
              <button
                onClick={onLearnMore}
                className="underline hover:text-white transition-colors"
                style={{ color: accentColor }}
              >
                Learn more
              </button>
            )}
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[rgb(113,118,123)] text-sm font-medium">$9/mo</span>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-5 py-2 rounded-full text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading…
              </span>
            ) : (
              "Go Pro"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
