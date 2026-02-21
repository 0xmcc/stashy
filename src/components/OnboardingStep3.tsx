"use client";

import { motion } from "framer-motion";
import { slideVariants, staggerContainer, staggerItem, easeOutExpo } from "./OnboardingVariants";

interface Props {
    direction: number;
    loading: boolean;
    onGoPro: () => void;
    onStartFree: () => void;
}

export function OnboardingStep3({ direction, loading, onGoPro, onStartFree }: Props) {
    return (
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
                        onClick={onGoPro}
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
                        onClick={onStartFree}
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
    );
}
