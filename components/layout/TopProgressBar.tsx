"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function TopProgressBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true); // show on initial load
  const [width, setWidth] = useState(0);
  const prevPathname = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  function startProgress() {
    setVisible(true);
    setWidth(0);

    // Ramp up quickly to 80%, then crawl — classic loading bar feel
    rafRef.current = requestAnimationFrame(() => {
      setWidth(30);
      timerRef.current = setTimeout(() => setWidth(60), 150);
      timerRef.current = setTimeout(() => setWidth(80), 400);
    });
  }

  function finishProgress() {
    setWidth(100);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300);
  }

  // Initial load — finish quickly
  useEffect(() => {
    startProgress();
    timerRef.current = setTimeout(() => finishProgress(), 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Route changes
  useEffect(() => {
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }

    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      startProgress();
      timerRef.current = setTimeout(() => finishProgress(), 400);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
        >
          <motion.div
            className="h-full bg-foreground origin-left"
            animate={{ scaleX: width / 100 }}
            transition={{
              duration: width === 100 ? 0.2 : 0.4,
              ease: [0.25, 1, 0.5, 1], // ease-out-quart — snappy
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}