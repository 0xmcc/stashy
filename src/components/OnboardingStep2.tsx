"use client";

import { motion } from "framer-motion";
import { slideVariants, staggerContainer, staggerItem } from "./OnboardingVariants";

interface Props {
    direction: number;
    onNext: () => void;
}

export function OnboardingStep2({ direction, onNext }: Props) {
    return (
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
                        onClick={onNext}
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
    );
}
