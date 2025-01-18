'use client';
import { useState, useMemo, useEffect } from 'react';
import { MaterialSymbolsSwipeUpRounded } from '../../../components/Icons';
import { motion, AnimatePresence } from 'motion/react';
import GestureHint from '../../../components/GestureHint';
import { motionProps } from '../../utils/motion';
import { createEntry } from '../../lib/journal';
import { useToast } from '../../contexts/toastContext/toastContext';
import Image from 'next/image';
import Link from 'next/link';
import fire from '../../../public/assets/brand/Fire.png';

export default function JournalInput({ showGestureHint, setShowGestureHint }) {
  const [ui, setUi] = useState('initial');
  const [entry, setEntry] = useState('');
  const { triggerToast } = useToast();

  function handleSubmitEntry() {
    createEntry({ content: entry })
      .catch((error) => triggerToast('An error occurred.'))
      .then((res) => setUi('submitted'));
  }

  return (
    <section className='p-6 pt-64 h-svh relative flex flex-col items-center'>
      <h1 className='text-center font-semibold mb-6'>Daily Journal</h1>
      <AnimatePresence>
        {ui === 'initial' && (
          <motion.textarea
            className='w-full text-xl border-none focus:outline-none resize-none h-96 overflow-auto [&::-webkit-scrollbar]:hidden entry'
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            id='entry'
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {entry === '' ? <MessagePlaceholder ui={ui} /> : null}

      <AnimatePresence>
        {entry != '' && ui === 'initial' ? (
          <motion.button
            {...motionProps(0)}
            type='button'
            className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
            onClick={handleSubmitEntry}
            exit={{ opacity: 0 }}
          >
            Log Entry
          </motion.button>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {ui === 'submitted' && (
          <motion.div
            className='flex justify-center flex-col items-center gap-5 col-end-1 row-end-1 z-20'
            {...motionProps(0)}
          >
            <Image
              src={fire}
              alt='Daily Dose Fire Emoticon'
              className='w-14 h-14 object-contain'
            />
            <h1 className='font-bold text-xl'>Journal logged!</h1>
            <motion.button
              {...motionProps(1)}
              className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
            >
              <Link href={'/home'}>Go Home &rarr;</Link>
            </motion.button>
          </motion.div>
        )}
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
