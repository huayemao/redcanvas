import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProcessingOverlayProps {
  isProcessing: boolean;
}

export default function ProcessingOverlay({ isProcessing }: ProcessingOverlayProps) {
  return (
    <AnimatePresence>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-paper)]/80 backdrop-blur-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-[1px] border-[var(--color-ink)]/20 border-t-[var(--color-accent)] rounded-full mb-6"
          />
          <p className="serif text-xl tracking-widest italic">Crafting Manuscript...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
