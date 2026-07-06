"use client";

import { motion } from "framer-motion";

// A thin client wrapper so the (server-rendered) Overview cards can get a
// subtle fade-in + hover lift without turning the whole page into a client
// component. Purely presentational — no layout/position change to what it
// wraps.
export function MotionCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
