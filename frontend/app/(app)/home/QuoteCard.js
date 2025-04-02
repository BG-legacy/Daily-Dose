'use client';
import { motion } from 'framer-motion';
import { motionProps } from '../../../app/utils/motion.js';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getAllJournalEntries } from '../../lib/journal';
import canon from '../../../public/assets/media/canon.jpg';

export default function QuoteCard() {
  const [quote, setQuote] = useState(null);

  useEffect(() => {
    const fetchLatestQuote = async () => {
      try {
        // Fetch all journal entries
        const entries = await getAllJournalEntries();
        
        // Sort entries by date and get the latest one with a quote
        const latestEntry = entries
          .sort((a, b) => new Date(b.CreationDate) - new Date(a.CreationDate))
          .find(entry => entry.Quote);

        if (latestEntry) {
          setQuote({
            quote: latestEntry.Quote,
            quoteID: latestEntry.id
          });
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
      }
    };

    fetchLatestQuote();
  }, []);

  // Show loading state or return null if no quote is available
  if (!quote) {
    return null;
  }

  let shareData = {
    title: 'Quote from Daily Dose',
    url: `${process.env.NEXT_PUBLIC_APP_URL}/quote/${quote.quoteID}`,
  };

  return (
    <section className='p-6 grid gap-3'>
      <motion.h1
        className={`text-white font-extrabold col-end-1 row-end-1 z-10 flex p-12 items-end ${
          quote.quote.length > 100 ? 'text-xl' : 'text-3xl'
        }`}
        {...motionProps(1)}
      >
        &quot;{quote.quote}&quot;
      </motion.h1>
      <motion.div {...motionProps(0)} className='col-end-1 row-end-1'>
        <Image
          src={canon}
          className='h-96 rounded-2xl'
          alt='Daily Quote Image'
        />
      </motion.div>
      {/* <motion.p className='text-center cursor-pointer col-end-1' {...motionProps(2)} onClick={() => navigator.share(shareData)}>Share Daily Quote</motion.p> */}
    </section>
  );
}
