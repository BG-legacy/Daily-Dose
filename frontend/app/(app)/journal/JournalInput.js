'use client';
import { useState, useMemo, useEffect } from 'react';
import { MaterialSymbolsProgressActivity, MaterialSymbolsSwipeUpRounded } from '../../../components/Icons';
import { motion, AnimatePresence } from 'motion/react';
import GestureHint from '../../../components/GestureHint';
import { motionProps } from '../../utils/motion';
import { createEntry } from '../../lib/journal';
import { useToast } from '../../contexts/toastContext/toastContext';
import Image from 'next/image';
import Link from 'next/link';
import fire from '../../../public/assets/brand/Fire.png';

export default function JournalInput({ showGestureHint, setShowGestureHint, refreshEntries }) {
  const [ui, setUi] = useState('initial');
  const [entry, setEntry] = useState('');
  const { triggerToast } = useToast();

  function handleSubmitEntry() {
    setUi('loading')
    createEntry({ content: entry })
      .then((res) => {
        setUi('submitted');
        // Call the refreshEntries callback to update the journal entries list
        if (refreshEntries) {
          refreshEntries();
        }
      })
      .catch((error) => {
        console.error('Error creating entry:', error);
        triggerToast('An error occurred.');
        setUi('initial');
      });
  }

  return (
    <section className='p-6 pt-56 h-svh relative flex flex-col items-center'>
      <h1 className='text-center font-semibold mb-6'>Daily Journal</h1>
      <AnimatePresence>
        {(ui === 'initial' || ui === 'loading') && (
          <motion.textarea
            className='w-full text-xl border-none focus:outline-none resize-none h-96 overflow-auto [&::-webkit-scrollbar]:hidden entry disabled:bg-white disabled:animate-pulse'
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            id='entry'
            exit={{ opacity: 0 }}
            disabled={ui === 'loading'}
          />
        )}
      </AnimatePresence>

      {entry === '' ? <MessagePlaceholder ui={ui} /> : null}

      <AnimatePresence>
        {entry != '' && ui === 'initial' || ui === 'loading' ? (
          <motion.button
            {...motionProps(0)}
            type='button'
            className={`bg-yellow-950 text-white px-6 py-4 font-bold rounded-full disabled:bg-yellow-950/60`}
            onClick={handleSubmitEntry}
            exit={{ opacity: 0 }}
            disabled={ui === 'loading'}
          >
            {ui === "loading" ?
              <span><MaterialSymbolsProgressActivity className='w-4 h-4 animate-spin' /></span> : "Log Entry"
            }

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
            <div className='flex flex-col gap-3 w-full'>
              <motion.button
                {...motionProps(1)}
                className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
                onClick={() => {
                  // Scroll to the entries section
                  document.getElementById('past-entries')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Entries
              </motion.button>
              <motion.button
                {...motionProps(2)}
                className='bg-white border border-yellow-950 text-yellow-950 px-6 py-4 font-bold rounded-full'
                onClick={() => {
                  // Reset the form to add a new entry
                  setUi('initial');
                  setEntry('');
                }}
              >
                New Entry
              </motion.button>
              <motion.button
                {...motionProps(3)}
                className='bg-white border border-yellow-950/30 text-yellow-950/70 px-6 py-4 font-bold rounded-full'
              >
                <Link href={'/home'}>Go Home</Link>
              </motion.button>
            </div>
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

function MessagePlaceholder() {
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
