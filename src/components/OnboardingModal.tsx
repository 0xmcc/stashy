"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { backdropVariants, modalVariants, easeOutExpo } from "./OnboardingVariants";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: (wentPro?: boolean) => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  const goToStep = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  const handleStartFree = () => {
    onClose(false);
  };

  const handleGoPro = async () => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => onClose(false)}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md rounded-2xl border border-[rgb(47,51,54)] overflow-hidden"
            style={{ background: "rgb(24,25,26)" }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Close button */}
            <motion.button
              onClick={() => onClose(false)}
              className="absolute top-4 right-4 z-10 text-[rgb(113,118,123)] hover:text-white transition-colors p-1.5 rounded-full hover:bg-[rgb(47,51,54)]"
              aria-label="Close"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Content */}
            <div className="p-8 min-h-[440px] flex flex-col overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {step === 1 && <OnboardingStep1 key="step1" direction={direction} onNext={() => goToStep(2)} />}
                {step === 2 && <OnboardingStep2 key="step2" direction={direction} onNext={() => goToStep(3)} />}
                {step === 3 && (
                  <OnboardingStep3
                    key="step3"
                    direction={direction}
                    loading={loading}
                    onGoPro={handleGoPro}
                    onStartFree={handleStartFree}
                  />
                )}
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {[1, 2, 3].map((s) => (
                  <motion.button
                    key={s}
                    onClick={() => goToStep(s)}
                    className="relative p-1"
                    aria-label={`Go to step ${s}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <motion.div
                      className="rounded-full"
                      animate={{
                        width: step === s ? 24 : 8,
                        height: 8,
                        backgroundColor: step === s ? "rgb(29,155,240)" : "rgb(47,51,54)",
                      }}
                      transition={{ duration: 0.3, ease: easeOutExpo }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
