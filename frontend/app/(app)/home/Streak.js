'use client';
import { motion } from 'framer-motion';
import { motionProps } from '../../utils/motion';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import fire from '../../../public/assets/brand/Fire.png';

export default function Streak({ weeklyJournalSummary }) {
  // For debugging
  useEffect(() => {
    if (weeklyJournalSummary?.debug) {
      console.log('Streak debug data:', weeklyJournalSummary.debug);
    }
    if (weeklyJournalSummary?.summary) {
      console.log('Weekly summary data:', weeklyJournalSummary.summary);
    }
  }, [weeklyJournalSummary]);

  var streak = 0;
  
  // Get the summary array from the response object
  const summary = weeklyJournalSummary?.summary;
  
  if (summary) {
    // Find today's index (generally the current day of the week, 0-6)
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    console.log('Today is day:', today);
    console.log('Today has entry:', summary[today]);
    
    // Count consecutive days up to today
    let consecutiveDays = 0;

    // First, count today if there's an entry
    if (summary[today]) {
      consecutiveDays++;
      
      // Then count backward from yesterday
      for (let i = 1; i <= today; i++) {
        const idx = today - i;
        if (summary[idx]) {
          consecutiveDays++;
        } else {
          break;
        }
      }
    }
    
    // Count consecutive days after today
    if (summary[today]) {
      for (let i = today + 1; i < summary.length; i++) {
        if (summary[i]) {
          consecutiveDays++;
        } else {
          break;
        }
      }
    }
    
    streak = consecutiveDays;
    console.log('Final calculated streak:', streak);
  }

  const sampleSummary = [true, false, true, false, true, true, true];
  
  if (summary) {
    return (
      <motion.section
        {...motionProps(1)}
        className='m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-2'
      >
        <p>Journaling Streak</p>
        <h2 className='text-2xl font-bold'>{streak} Day Streak 🔥</h2>
        <div className='flex gap-2.5'>
          {summary.map((j, index) => (
            <motion.div {...motionProps(index * 0.2)} key={index}>
              <Image
                src={fire}
                className={`${j ? '' : 'grayscale opacity-50'}`}
                alt='Daily Dose Streak Emoticon'
              />
            </motion.div>
          ))}
        </div>
        {!summary[new Date().getDay()] && (
          <Link
            href='/journal'
            className='w-full text-center mt-4 bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
          >
            {streak > 0
              ? 'Keep Up Your Streak'
              : 'Log Daily Entry'}{' '}
            &rarr;
          </Link>
        )}
      </motion.section>
    );
  } else {
    return (
      <motion.section
        {...motionProps(1)}
        className='m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-2'
      >
        <p>Journaling Streak</p>
        <h2 className='text-2xl font-bold'>
          Start journaling to start your streak 🔥
        </h2>
        <div className='flex gap-2.5 opacity-50'>
          {sampleSummary.map((j, index) => (
            <motion.div {...motionProps(index * 0.2)} key={index}>
              <Image
                src={fire}
                className={`${j ? '' : 'grayscale opacity-50'}`}
                alt='Daily Dose Streak Emoticon'
              />
            </motion.div>
          ))}
        </div>
        <Link
          href='/journal'
          className='w-full text-center mt-4 bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
        >
          Log Daily Entry &rarr;
        </Link>
      </motion.section>
    );
  }
}
