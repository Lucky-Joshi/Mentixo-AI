import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Rocket } from 'lucide-react';

const UpgradeModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-surface border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]">

              {/* Header gradient */}
              <div className="relative bg-gradient-to-br from-primary/30 via-primary/10 to-surface p-8 text-center overflow-hidden">
                <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/20 border border-primary/30 rounded-[1.25rem] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                    <Rocket className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Upgrade to Mentixo Pro
                  </h2>
                  <p className="text-sm text-text-muted mt-2 font-medium">
                    You've reached your daily limit.
                  </p>
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                <p className="text-sm text-text-muted text-center leading-relaxed">
                  Upgrade to continue learning without limits. Get unlimited AI chat, notes, quizzes, and file uploads every day.
                </p>

                {/* Feature list */}
                <div className="space-y-3">
                  {[
                    "Unlimited daily AI messages",
                    "Unlimited notes generation",
                    "Unlimited quiz attempts",
                    "Priority file upload processing",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                        <Zap className="w-3 h-3 text-primary fill-current" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    disabled
                    className="w-full py-4 bg-primary text-white font-black rounded-2xl opacity-60 cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                  >
                    <Rocket className="w-4 h-4" />
                    Upgrade — Coming Soon
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-text-muted hover:text-white border border-white/5 rounded-2xl font-bold text-sm transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
