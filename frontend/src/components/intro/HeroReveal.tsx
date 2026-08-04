import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface HeroRevealProps {
  children: ReactNode;
  show: boolean;
}

export function HeroReveal({ children, show }: HeroRevealProps) {
  return (
    <motion.div
      initial="hidden"
      animate={show ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          }
        }
      }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
