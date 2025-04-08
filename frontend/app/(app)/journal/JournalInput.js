'use client';
import { useState, useMemo, useEffect } from 'react';
import { MaterialSymbolsProgressActivity, MaterialSymbolsSwipeUpRounded } from '../../../components/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import GestureHint from '../../../components/GestureHint';
import { motionProps } from '../../utils/motion';
import { createEntry, getWeeklyJournalSummary } from '../../lib/journal';
import { useToast } from '../../contexts/toastContext/toastContext';
import Image from 'next/image';
import Link from 'next/link';
import fire from '../../../public/assets/brand/Fire.png';
import AI from '../../../public/assets/brand/AI.png';
import { useRouter } from 'next/navigation';

/**
 * TypewriterText Component
 * Displays text with a typewriter animation effect
 * @param {string} text - The text to be animated
 * @param {function} onComplete - Callback function to execute when animation completes
 */
function TypewriterText({ text = '', onComplete }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 30); // Adjust speed here (lower number = faster)

      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, onComplete]);

  return (
    <div className="space-y-4">
      <span>{displayText}</span>
      {isComplete && (
        <motion.div {...motionProps(1)} className="flex justify-end">
          <button
            onClick={onComplete}
            className="bg-yellow-950 text-white px-4 py-2 rounded-full text-sm font-medium mt-4"
          >
            Continue
          </button>
        </motion.div>
      )}
    </div>
  );
}

/**
 * JournalInput Component
 * Main component for journal entry creation and display of AI-generated insights
 * @param {boolean} showGestureHint - Controls visibility of gesture hint
 * @param {function} setShowGestureHint - Function to update gesture hint visibility
 * @param {function} refreshEntries - Function to refresh the list of journal entries
 */
export default function JournalInput({ showGestureHint, setShowGestureHint, refreshEntries }) {
  // UI state management
  const [ui, setUi] = useState('initial'); // Controls which UI view is displayed
  const [entry, setEntry] = useState(''); // Stores the journal entry content
  const [insights, setInsights] = useState(null); // Stores AI-generated insights
  const [currentInsight, setCurrentInsight] = useState(0); // Tracks current insight being displayed
  const { triggerToast } = useToast();
  const router = useRouter();

  /**
   * Handles journal entry submission and fetches AI insights
   */
  function handleSubmitEntry() {
    setUi('loading')
    createEntry({ content: entry })
      .then((res) => {
        // Check if we have insights in the response
        if (!res.insights || !res.insights.mentalHealthTip || !res.insights.productivityHack || !res.insights.quote) {
          throw new Error('Incomplete insights received');
        }
        
        setInsights({
          mentalHealthTip: res.insights.mentalHealthTip,
          productivityHack: res.insights.productivityHack,
          quote: res.insights.quote
        });
        setUi('insights');
        
        // Refresh streak data immediately
        getWeeklyJournalSummary().catch(error => {
          console.error('Error refreshing journal summary:', error);
        });
      })
      .catch((error) => {
        console.error('Error creating entry:', error);
        triggerToast('An error occurred while generating insights.');
        setUi('initial');
      });
  }

  // Define different types of insights to be displayed
  const insightTypes = [
    { title: 'Mental Health Tip', key: 'mentalHealthTip' },
    { title: 'Productivity Hack', key: 'productivityHack' },
    { title: 'Quote', key: 'quote' }
  ];

  /**
   * Handles the completion of each insight display
   * Moves to next insight or completes the process
   */
  function handleInsightComplete() {
    if (currentInsight < insightTypes.length - 1) {
      setCurrentInsight(prev => prev + 1);
    } else {
      setUi('submitted');
      
      // Refresh entries if the function is provided
      if (refreshEntries) {
        refreshEntries();
      }
      
      // After a short delay, redirect to home to see updated streak
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    }
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
        {ui === 'insights' && insights && (
          <motion.div
            className='flex justify-center flex-col items-center gap-5 col-end-1 row-end-1 z-20 w-full'
            {...motionProps(0)}
          >
            <div className='flex gap-2 font-semibold text-lg mb-4 items-center'>
              <Image
                src={AI}
                alt='Daily Dose AI Emoticon'
                className='w-14 h-14 object-contain'
              />
              <h2 className='text-xl'>AI Insights</h2>
            </div>
            <div className='bg-white rounded-lg p-6 shadow-sm w-full'>
              <div className='space-y-6'>
                {insightTypes.map((type, index) => (
                  index === currentInsight && (
                    <motion.div key={type.key} {...motionProps(index)}>
                      <h3 className='text-lg font-medium mb-3'>{type.title}</h3>
                      <div className='min-h-[4em]'>
                        <TypewriterText 
                          text={insights[type.key]} 
                          onComplete={handleInsightComplete}
                        />
                      </div>
                    </motion.div>
                  )
                ))}
              </div>
            </div>
          </motion.div>
        )}
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
                  document.getElementById('past-entries')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Entries
              </motion.button>
              <motion.button
                {...motionProps(2)}
                className='bg-white border border-yellow-950 text-yellow-950 px-6 py-4 font-bold rounded-full'
                onClick={() => {
                  setUi('initial');
                  setEntry('');
                  setInsights(null);
                  setCurrentInsight(0);
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

/**
 * MessagePlaceholder Component
 * Displays rotating placeholder messages in the journal input
 * when it's empty
 */
function MessagePlaceholder() {
  // Array of placeholder messages to cycle through
  const messages = useMemo(
    () => [
      'Today I overcame...',
      "I'm feeling grateful for...",
      'Type here to start your journal...',
    ],
    []
  );

  // Set up message rotation interval
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
