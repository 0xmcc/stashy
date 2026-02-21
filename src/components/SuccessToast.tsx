"use client";

import { useEffect } from "react";

export function SuccessToast({ onDismiss }: { onDismiss: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="animate-slide-down fixed left-1/2 top-4 z-50 -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-600/90 px-5 py-3 text-white shadow-lg backdrop-blur-md">
                <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="text-sm font-medium">Welcome to Pro! 🎉 Your upgrade is active.</span>
                <button onClick={onDismiss} className="ml-1 text-white/70 hover:text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
