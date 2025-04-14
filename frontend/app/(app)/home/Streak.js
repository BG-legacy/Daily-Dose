'use client';
import { motion } from 'framer-motion';
import { motionProps } from '../../utils/motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import fire from '../../../public/assets/brand/Fire.png';

export default function Streak({ weeklyJournalSummary, weeklyMoodSummary }) {
  const [streak, setStreak] = useState(0);
  const [summary, setSummary] = useState(null);

  // For debugging
  useEffect(() => {
    if (weeklyJournalSummary?.debug) {
      console.log('Streak debug data:', weeklyJournalSummary.debug);
    }
    if (weeklyJournalSummary?.summary) {
      console.log('Weekly summary data:', weeklyJournalSummary.summary);
    }
    if (weeklyMoodSummary?.data) {
      console.log('Weekly mood data:', weeklyMoodSummary.data);
    }
  }, [weeklyJournalSummary, weeklyMoodSummary]);

  // Calculate streak when data changes
  useEffect(() => {
    if (weeklyJournalSummary?.summary || weeklyMoodSummary?.data) {
      const journalSummary = weeklyJournalSummary?.summary || [];
      const moodSummary = weeklyMoodSummary?.data || [];
      
      // Get today's index
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Count consecutive days up to today
      let consecutiveDays = 0;

      // First, count today if there's an entry for either journal or mood
      if (journalSummary[today] || moodSummary[today]) {
        consecutiveDays++;
        
        // Then count backward from yesterday
        for (let i = 1; i <= today; i++) {
          const idx = today - i;
          if (journalSummary[idx] || moodSummary[idx]) {
            consecutiveDays++;
          } else {
            break;
          }
        }
      }
      
      // Count consecutive days after today
      if (journalSummary[today] || moodSummary[today]) {
        for (let i = today + 1; i < Math.max(journalSummary.length, moodSummary.length); i++) {
          if (journalSummary[i] || moodSummary[i]) {
            consecutiveDays++;
          } else {
            break;
          }
        }
      }
      
      setStreak(consecutiveDays);
      
      // Create a combined summary array
      const combinedSummary = Array(7).fill(false).map((_, index) => 
        journalSummary[index] || moodSummary[index] ? true : false
      );
      setSummary(combinedSummary);
    }
  }, [weeklyJournalSummary, weeklyMoodSummary]);

  const sampleSummary = [true, false, true, false, true, true, true];
  
  if (summary) {
    return (
      <motion.section
        {...motionProps(1)}
        className='m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-2'
      >
        <p>Daily Activity Streak</p>
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
        <p>Daily Activity Streak</p>
        <h2 className='text-2xl font-bold'>
          Start journaling or logging your mood to start your streak 🔥
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
