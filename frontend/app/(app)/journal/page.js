'use client';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { getAllJournalEntries } from '../../lib/journal';
import JournalInput from './JournalInput';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../contexts/toastContext/toastContext';
import { motion } from 'motion/react';
import { fadeInProps } from '../../utils/motion';

/**
 * Main Journal Page Component
 * Displays journal input and list of past entries
 */
export default function Page() {
  // State Management
  const [journalEntries, setJournalEntries] = useState(null); // Stores all journal entries
  const { triggerToast } = useToast(); // Toast notification system
  const [showGestureHint, setShowGestureHint] = useState(true); // Controls gesture hint visibility
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Function to fetch all journal entries
   */
  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAllJournalEntries();

      // Deduplicate entries by ID
      const uniqueEntries = new Map();
      res.forEach((entry) => {
        const id = entry.id || `${entry.UserID}#${entry.CreationDate}`;
        if (!uniqueEntries.has(id)) {
          uniqueEntries.set(id, entry);
        }
      });

      setJournalEntries(Array.from(uniqueEntries.values()));
    } catch (error) {
      console.error('Error fetching entries:', error);
      triggerToast('An error occurred while fetching entries.');
    } finally {
      setIsLoading(false);
    }
  }, [triggerToast]);

  /**
   * Effect Hook to fetch all journal entries on component mount
   */
  useEffect(() => {
    let isMounted = true;

    const loadEntries = async () => {
      if (isMounted) {
        await fetchEntries();
      }
    };

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, [fetchEntries]);

  return (
    <Layout route='journal' onClick={() => setShowGestureHint(false)}>
      {/* Journal Input Component */}
      <JournalInput
        showGestureHint={showGestureHint}
        setShowGestureHint={setShowGestureHint}
        refreshEntries={fetchEntries}
      />

      {/* Past Entries Section */}
      <section id="past-entries" className='grid grid-cols-2 gap-5 p-6 pb-32'>
        <div className='col-span-2 flex justify-between items-center'>
          <h2 className='font-semibold text-lg'>Past Entries</h2>
          {isLoading && <span className='text-sm text-gray-500'>Refreshing...</span>}
        </div>

        {/* Conditional Rendering of Entries */}
        {!isLoading && journalEntries != null ? (
          journalEntries.map((entry, index) => (
            <EntryCard entry={entry} key={index} pos={index} />
          ))
        ) : (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
        {journalEntries == null && (
          <p className='text-center w-full col-span-2 text-black/50'>
            Past entries will show up here, add an entry to get started.
          </p>
        )}
      </section>
    </Layout>
  );
}

/**
 * Array of weekday abbreviations for date display
 * @constant {string[]}
 */
const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

/**
 * EntryCard Component
 * Displays a preview of a journal entry with date
 *
 * @param {Object} props - Component props
 * @param {Object} props.entry - Journal entry data
 * @param {Number} pos - Position in array
 */
function EntryCard({ entry, pos }) {
  // Parse the entry date
  const date = new Date(entry.CreationDate);

  // Ensure we're using the correct ID format
  const entryId = entry.id || `${entry.UserID}#${entry.CreationDate}`;

  return (
    <Link href={`/journal/${encodeURIComponent(entryId)}`}>
      <motion.article
        className='p-6 bg-neutral-100/50 rounded-2xl flex flex-col gap-4 h-full'
        {...fadeInProps(pos)}
      >
        {/* Date Display */}
        <div className='flex flex-col gap-1 items-center justify-center rounded-lg w-14 bg-white'>
          <p className='text-xs font-semibold bg-yellow-200 w-full rounded-t-lg text-center py-1'>
            {weekday[date.getDay()]}
          </p>
          <p className='text-lg font-bold '>{date.getDate()}</p>
        </div>
        {/* Entry Preview */}
        <p className='line-clamp-2'>{entry.Content}</p>
      </motion.article>
    </Link>
  );
}

/**
 * SkeletonCard component
 * skeleton loading state for entry cards
 */
function SkeletonCard() {
  return (
    <article className='p-6 bg-neutral-100/50 rounded-2xl flex flex-col gap-4 animate-pulse'>
      {/* date display */}
      <div className='flex flex-col gap-1 items-center justify-center rounded-lg w-14 bg-white'>
        <p className='text-xs font-semibold bg-neutral-200 w-full rounded-t-lg text-center py-1'>
          MON
        </p>
        <p className='text-lg font-bold'>01</p>
      </div>
      {/* entry preview */}
      <p className='line-clamp-2 text-neutral-100'>
        ███████
        <br />
        ███████
      </p>
    </article>
  );
}
