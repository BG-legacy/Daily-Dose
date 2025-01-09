'use client';
import { motion } from 'motion/react'
import { motionProps } from '../../utils/motion';

import Image from 'next/image';
import Link from 'next/link';
import fire from '../../../public/assets/brand/Fire.png'

export default function Streak({ weeklyJournalSummary }) {
  return (
    <motion.section {...motionProps(1)} className="m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-2">
      <p>Journaling Streak</p>
      <h2 className='text-2xl font-bold'>3 Day Streak 🔥</h2>
      <div className='flex gap-2.5'>
        {weeklyJournalSummary.map((j, index) => (
          <motion.div {...motionProps(index * .2)} key={index}><Image src={fire} className={`${j ? '' : 'grayscale opacity-50'}`} alt='Daily Dose Streak Emoticon' /></motion.div>
        ))}
      </div>
      {!weeklyJournalSummary[weeklyJournalSummary.length - 1] &&
        <Link href='/journal' className='w-full text-center mt-4 bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'>{weeklyJournalSummary[weeklyJournalSummary.length - 2] ? 'Keep Up Your Streak' : 'Log Daily Entry'} &rarr;</Link>
      }
    </motion.section>
  )
}
