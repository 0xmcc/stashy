"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: (wentPro?: boolean) => void;
}

// Easing curves
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Animation variants with proper typing
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: easeOutExpo },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    transition: { duration: 0.25, ease: easeOutExpo },
  }),
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOutExpo },
  },
};

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
                {/* Step 1: Welcome */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                      {/* Stashy the Squirrel */}
                      <motion.div variants={staggerItem} className="mb-5 relative flex justify-center">
                        <motion.div
                          className="text-7xl select-none"
                          animate={{
                            y: [0, -8, 0],
                            rotate: [0, 5, 0, -5, 0],
                          }}
                          transition={{
                            y: { duration: 2, ease: "easeInOut", repeat: Infinity },
                            rotate: { duration: 4, ease: "easeInOut", repeat: Infinity },
                          }}
                        >
                          🐿️
                        </motion.div>
                        {/* Acorn accents */}
                        <motion.div
                          className="absolute -top-1 right-[calc(50%-52px)] text-xl select-none"
                          animate={{
                            y: [0, -4, 0],
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                          }}
                        >
                          🌰
                        </motion.div>
                        <motion.div
                          className="absolute bottom-1 left-[calc(50%-48px)] text-lg select-none"
                          animate={{
                            y: [0, -3, 0],
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: 0.5,
                          }}
                        >
                          🌰
                        </motion.div>
                      </motion.div>

                      <motion.h2 variants={staggerItem} className="text-2xl font-bold text-white mb-2">
                        Hey! I&apos;m Stashy 👋
                      </motion.h2>
                      <motion.p variants={staggerItem} className="text-[rgb(160,165,170)] text-base mb-8 max-w-xs mx-auto leading-relaxed">
                        I help you hoard the best tweets like acorns for winter. Never lose a banger again!
                      </motion.p>

                      <motion.div variants={staggerItem}>
                        <motion.button
                          onClick={() => goToStep(2)}
                          className="w-full max-w-xs py-3 rounded-full bg-[rgb(29,155,240)] text-white font-semibold text-sm"
                          whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          Let&apos;s get nuts 🥜
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: How it works */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex-1 flex flex-col items-center justify-center"
                  >
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="w-full">
                      <motion.div variants={staggerItem} className="text-center mb-6">
                        <span className="text-4xl">🐿️</span>
                        <motion.h2 className="text-xl font-bold text-white mt-2">
                          Here&apos;s my stash strategy
                        </motion.h2>
                      </motion.div>

                      <div className="space-y-5 w-full max-w-xs mx-auto mb-8">
                        {[
                          {
                            emoji: "🌰",
                            title: "Grab tweets with one click",
                            desc: "See a gem? I'll stash it instantly",
                          },
                          {
                            emoji: "🔍",
                            title: "Find any tweet, anytime",
                            desc: "Unlike my actual acorns, you won't lose these",
                          },
                          {
                            emoji: "🧠",
                            title: "Smart summaries",
                            desc: "I'll tell you what's worth reading",
                          },
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            variants={staggerItem}
                            className="flex items-start gap-4"
                          >
                            <motion.span
                              className="text-2xl"
                              animate={{
                                y: [0, -2, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3,
                              }}
                            >
                              {item.emoji}
                            </motion.span>
                            <div>
                              <p className="text-white text-sm font-medium">{item.title}</p>
                              <p className="text-[rgb(113,118,123)] text-xs mt-0.5">{item.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div variants={staggerItem} className="flex justify-center">
                        <motion.button
                          onClick={() => goToStep(3)}
                          className="w-full max-w-xs py-3 rounded-full bg-[rgb(29,155,240)] text-white font-semibold text-sm"
                          whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          What&apos;s it cost? 💰
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3: Free vs Pro */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex-1 flex flex-col"
                  >
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex-1 flex flex-col">
                      <motion.div variants={staggerItem} className="text-center mb-5">
                        <span className="text-3xl">🐿️</span>
                        <motion.h2 className="text-xl font-bold text-white mt-1">
                          Pick your stash size
                        </motion.h2>
                      </motion.div>

                      <div className="space-y-4 flex-1">
                        {/* Free tier */}
                        <motion.div
                          variants={staggerItem}
                          className="rounded-xl border border-[rgb(47,51,54)] p-4 bg-[rgb(36,37,38)] transition-colors hover:border-[rgb(60,63,66)]"
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-bold">🌱 Starter Squirrel</h3>
                            <span className="text-[rgb(113,118,123)] text-sm">Free</span>
                          </div>
                          <p className="text-[rgb(113,118,123)] text-sm">
                            30 acorns... I mean tweets
                          </p>
                        </motion.div>

                        {/* Pro tier */}
                        <motion.div
                          variants={staggerItem}
                          className="rounded-xl border-2 border-[rgb(29,155,240)] p-4 relative overflow-hidden"
                          style={{
                            background: "linear-gradient(135deg, rgba(29,155,240,0.08) 0%, rgba(120,86,255,0.04) 100%)",
                          }}
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Animated gradient border glow */}
                          <motion.div
                            className="absolute inset-0 opacity-20 pointer-events-none"
                            animate={{
                              background: [
                                "radial-gradient(circle at 0% 0%, rgb(29,155,240) 0%, transparent 50%)",
                                "radial-gradient(circle at 100% 100%, rgb(120,86,255) 0%, transparent 50%)",
                                "radial-gradient(circle at 0% 0%, rgb(29,155,240) 0%, transparent 50%)",
                              ],
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          />
                          
                          {/* Badge */}
                          <motion.div
                            className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-[rgb(29,155,240)] text-[10px] font-bold text-white"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.3, ease: easeOutExpo }}
                          >
                            🏆 TOP STASHER
                          </motion.div>

                          <div className="flex items-center justify-between mb-3 mt-1 relative">
                            <h3 className="text-white font-bold">🐿️ Pro Squirrel</h3>
                            <span className="text-white text-sm font-medium">$9/mo</span>
                          </div>
                          <ul className="space-y-1.5 relative">
                            {["Unlimited acorn storage", "Smart summaries", "Organize by tree (tags)", "Take your nuts anywhere"].map((feature, i) => (
                              <motion.li
                                key={feature}
                                className="flex items-center gap-2 text-[rgb(200,200,200)] text-sm"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.08, duration: 0.3, ease: easeOutExpo }}
                              >
                                <svg className="w-4 h-4 text-[rgb(29,155,240)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                                {feature}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      </div>

                      {/* Buttons */}
                      <motion.div variants={staggerItem} className="flex flex-col gap-3 mt-6">
                        <motion.button
                          onClick={handleGoPro}
                          disabled={loading}
                          className="w-full py-3 rounded-full bg-gradient-to-r from-[rgb(29,155,240)] to-[rgb(120,86,255)] text-white font-semibold text-sm disabled:opacity-50 relative overflow-hidden"
                          whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          />
                          <span className="relative">
                            {loading ? (
                              <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Loading…
                              </span>
                            ) : (
                              "Become Pro Squirrel 🐿️"
                            )}
                          </span>
                        </motion.button>
                        <motion.button
                          onClick={handleStartFree}
                          className="w-full py-3 rounded-full border border-[rgb(47,51,54)] text-white font-medium text-sm hover:bg-[rgb(36,37,38)] transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                        >
                          Start small (free)
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
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
