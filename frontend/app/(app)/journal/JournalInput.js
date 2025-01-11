'use client';
import { useState, useMemo, useEffect } from 'react';
import { MaterialSymbolsSwipeUpRounded } from '../../../components/Icons';
import { motion, AnimatePresence } from 'motion/react';
import GestureHint from '../../../components/GestureHint';
import { motionProps } from '../../utils/motion';

export default function JournalInput() {
  const [ui, setUi] = useState('initial');
  const [entry, setEntry] = useState('');
  const [showGestureHint, setShowGestureHint] = useState(true);

  function hideHint() {
    setShowGestureHint(false);
  }

  return (
    <section
      className='p-6 pt-64 h-svh relative flex flex-col items-center'
      onClick={hideHint}
      onDragStart={hideHint}
      onTouchStart={hideHint}
      onScroll={hideHint}
    >
      <h1 className='text-center font-semibold mb-6'>Daily Journal</h1>
      <textarea
        className='w-full text-xl border-none focus:outline-none resize-none h-96 overflow-auto [&::-webkit-scrollbar]:hidden entry'
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        id='entry'
      />
      {entry === '' ? <MessagePlaceholder ui={ui} /> : null}

      <AnimatePresence>
        {entry != '' ? (
          <motion.button
            {...motionProps(0)}
            type='button'
            className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
          >
            Log Entry
          </motion.button>
        ) : null}
      </AnimatePresence>
      {entry === '' ? (
        <GestureHint
          showGestureHint={showGestureHint}
          setShowGestureHint={setShowGestureHint}
          top={60}
        >
          <div className='text-yellow-950/20 animate-pulse gap-3 flex flex-col items-center'>
            <MaterialSymbolsSwipeUpRounded className='w-8 h-8' />
            <p>
              <span className='md:hidden'>Swipe</span>
              <span className='hidden md:inline-block'>Scroll</span> to see past
              entries
            </p>
          </div>
        </GestureHint>
      ) : null}
    </section>
  );
}

function MessagePlaceholder({ ui }) {
  const messages = useMemo(
    () => [
      'Today I overcame...',
      "I'm feeling grateful for...",
      'Type here to start your journal...',
    ],
    []
  );

  useEffect(() => {
    let currentIndex = 0;
    const label = document.getElementById('label');
    if (!label) return;

    label.style.animationPlayState = 'running';
    label.innerText = messages[messages.length - 1];

    const interval = setInterval(() => {
      label.innerText = messages[currentIndex];
      currentIndex = (currentIndex + 1) % messages.length;
    }, 4000);

    return () => clearInterval(interval);
  }, [messages]);
  return (
    <label
      htmlFor='entry'
      className={`placeholderAnimation font-semibold text-xl text-balance transition-all pointer-events-none top-[304px] absolute left-6`}
      id='label'
    ></label>
  );
}
