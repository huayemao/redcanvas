import React from 'react';
import { motion } from 'framer-motion';
import { Upload, ImageIcon, Droplet, Sparkles, Music } from 'lucide-react';

interface IntroScreenProps {
  getRootProps: () => any;
  getInputProps: () => any;
  isDragActive: boolean;
  useSampleFile: (filePath: string, isPdf: boolean) => void;
}

export default function IntroScreen({ getRootProps, getInputProps, isDragActive, useSampleFile }: IntroScreenProps) {
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 flex flex-col items-center justify-center z-10"
    >
      {/* Musical Staves Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="staves" width="200" height="120" patternUnits="userSpaceOnUse">
            <path d="M0,20 H200 M0,30 H200 M0,40 H200 M0,50 H200 M0,60 H200" stroke="var(--color-ink)" strokeWidth="1" fill="none" />
            <path d="M10,20 V60 M190,20 V60" stroke="var(--color-ink)" strokeWidth="2" fill="none" />
            <path d="M25,50 C25,65 40,65 40,50 C40,35 25,35 25,20 C25,5 40,5 40,20 C40,45 20,45 20,70 C20,80 30,80 30,70" stroke="var(--color-ink)" strokeWidth="1.5" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#staves)" />
        </svg>
      </div>

      <div className="text-center mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-[var(--color-ink)] text-[var(--color-paper)] flex items-center justify-center shadow-2xl shadow-[var(--color-ink)]/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]"></div>
          <Music className="w-10 h-10 relative z-10" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
          className="serif text-6xl md:text-8xl font-medium tracking-tight mb-6 text-[var(--color-ink)]"
        >
          prettyscore
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-sm md:text-lg tracking-wide opacity-70 font-medium max-w-xl mx-auto leading-relaxed"
        >
          Elevate your digital sheet music. Transform standard PDFs and SVGs into breathtaking historical manuscripts with authentic paper textures, custom ink, and elegant motifs.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="w-full max-w-2xl px-6 relative z-10"
      >
        <div
          {...getRootProps()}
          className={`relative overflow-hidden group border border-[var(--color-ink)]/20 bg-white/60 backdrop-blur-xl rounded-3xl p-16 text-center cursor-pointer transition-all duration-500 shadow-xl shadow-[var(--color-ink)]/5 ${isDragActive ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 scale-[1.02]' : 'hover:border-[var(--color-ink)]/40 hover:bg-white/90 hover:shadow-2xl hover:shadow-[var(--color-ink)]/10'}`}
        >
          <input {...getInputProps()} />
          
          {/* Corner Accents */}
          <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-[var(--color-ink)]/20 group-hover:border-[var(--color-accent)] transition-colors" />
          <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-[var(--color-ink)]/20 group-hover:border-[var(--color-accent)] transition-colors" />
          <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-[var(--color-ink)]/20 group-hover:border-[var(--color-accent)] transition-colors" />
          <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-[var(--color-ink)]/20 group-hover:border-[var(--color-accent)] transition-colors" />

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-ink)]/5 flex items-center justify-center group-hover:bg-[var(--color-accent)]/10 transition-colors duration-500">
            <Upload className="w-8 h-8 opacity-60 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all duration-500 group-hover:-translate-y-1" />
          </div>
          <p className="serif text-3xl mb-4 text-[var(--color-ink)] font-medium">Upload your score</p>
          <p className="text-xs tracking-[0.2em] opacity-50 uppercase font-semibold">Supports PDF & SVG formats</p>
        </div>
      </motion.div>

      {/* Sample Files Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-10 w-full max-w-2xl px-6 relative z-10"
      >
        <p className="serif text-sm mb-4 text-center text-[var(--color-ink)]/70">Or try with sample files</p>
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => useSampleFile('/prettyscore/score_sample.pdf', true)}
            className="px-6 py-3 border border-[var(--color-ink)]/20 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:border-[var(--color-ink)]/40 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium text-[var(--color-ink)]"
          >
            Sample PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => useSampleFile('/prettyscore/score_sample.svg', false)}
            className="px-6 py-3 border border-[var(--color-ink)]/20 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:border-[var(--color-ink)]/40 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium text-[var(--color-ink)]"
          >
            Sample SVG
          </motion.button>
        </div>
      </motion.div>
      
      {/* Features list */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-16 flex gap-12 text-center opacity-60 relative z-10"
      >
         <div className="flex flex-col items-center gap-2">
           <ImageIcon className="w-5 h-5" />
           <span className="text-xs uppercase tracking-widest font-medium">Procedural Paper</span>
         </div>
         <div className="flex flex-col items-center gap-2">
           <Droplet className="w-5 h-5" />
           <span className="text-xs uppercase tracking-widest font-medium">Custom Ink</span>
         </div>
         <div className="flex flex-col items-center gap-2">
           <Sparkles className="w-5 h-5" />
           <span className="text-xs uppercase tracking-widest font-medium">Vintage Motifs</span>
         </div>
      </motion.div>
    </motion.div>
  );
}
