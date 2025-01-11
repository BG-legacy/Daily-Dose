'use client';

import { useState, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { motionProps } from '../../utils/motion';

const ToastContext = createContext(null);
const TOAST_DURATION = 3000;

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function triggerToast(newToast) {
    setToast(newToast);
    setTimeout(() => {
      setToast(null);
    }, TOAST_DURATION);
  }

  return (
    <ToastContext.Provider value={{ toast, triggerToast }}>
      {children}
      {/* Toast Component */}
      <AnimatePresence>
        {toast && (
          <motion.div
            {...motionProps(0)}
            exit={{ opacity: 0 }}
            className={`fixed top-30 left-0 right-0 rounded-lg bg-red-700 text-white w-max mx-auto px-8 py-2 font-bold z-20 cursor-grab select-none`}
            onPointerDown={() => setToast(null)}
            drag='y'
            dragConstraints={{ top: 10, bottom: 10 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
