"use client";

import { motion } from "framer-motion";
import { slideVariants, staggerContainer, staggerItem } from "./OnboardingVariants";

interface Props {
    direction: number;
    onNext: () => void;
}

export function OnboardingStep1({ direction, onNext }: Props) {
    return (
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
                        onClick={onNext}
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
    );
}
