import { useEffect } from "react";

import { AnimatePresence, motion } from 'motion/react'

export default function GestureHint({ showGestureHint, setShowGestureHint, children, top }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowGestureHint(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [showGestureHint]);


  return (
    <AnimatePresence>
      {showGestureHint &&
        <motion.div key='gesture' transition={{ ease: 'circInOut', duration: .8 }} initial={{ opacity: 0, translateY: 25 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: 25 }} className="absolute left-0 right-0 flex items-center justify-center w-full" style={{ top: `${top}%` }}>
          {children}
        </motion.div>
      }
    </AnimatePresence>
  )
}
