"use client";

import { motion, useReducedMotion, type Easing } from "framer-motion";
import type { ReactNode } from "react";

const EASE_PREMIERE: Easing = [0.16, 1, 0.3, 1];

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? undefined : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE_PREMIERE }}
    >
      {children}
    </motion.div>
  );
}
