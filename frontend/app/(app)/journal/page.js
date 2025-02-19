'use client';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { getAllJournalEntries } from '../../lib/journal';
import JournalInput from './JournalInput';
import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/toastContext/toastContext';

/**
 * Main Journal Page Component
 * Displays journal input and list of past entries
 */
export default function Page() {
  // State Management
  const [journalEntries, setJournalEntries] = useState(null);  // Stores all journal entries
  const { triggerToast } = useToast();  // Toast notification system
  const [showGestureHint, setShowGestureHint] = useState(true);  // Controls gesture hint visibility
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Effect Hook to fetch all journal entries on component mount
   */
  useEffect(() => {
    let isMounted = true;
    
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        const res = await getAllJournalEntries();
        
        if (isMounted) {
          // Deduplicate entries by ID
          const uniqueEntries = new Map();
          res.forEach(entry => {
            const id = entry.id || `${entry.UserID}#${entry.CreationDate}`;
            if (!uniqueEntries.has(id)) {
              uniqueEntries.set(id, entry);
            }
          });
          
          setJournalEntries(Array.from(uniqueEntries.values()));
        }
      } catch (error) {
        if (isMounted) {
          triggerToast('An error occurred.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEntries();
    
    return () => {
      isMounted = false;
    };
  }, [triggerToast]);

  return (
    <Layout route='journal' onClick={() => setShowGestureHint(false)}>
      {/* Journal Input Component */}
      <JournalInput
        showGestureHint={showGestureHint}
        setShowGestureHint={setShowGestureHint}
      />

      {/* Past Entries Section */}
      <section className='grid grid-cols-2 gap-5 p-6 pb-32'>
        <h2 className='col-span-2 font-semibold text-lg'>Past Entries</h2>

        {/* Conditional Rendering of Entries */}
        {journalEntries != null ? (
          journalEntries.map((entry, index) => (
            <EntryCard entry={entry} key={index} />
          ))
        ) : (
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
 */
function EntryCard({ entry }) {
  // Parse the entry date
  const date = new Date(entry.CreationDate);
  
  // Ensure we're using the correct ID format
  const entryId = entry.id || `${entry.UserID}#${entry.CreationDate}`;
  
  return (
    <Link href={`/journal/${encodeURIComponent(entryId)}`}>
      <article className='p-6 bg-neutral-100/50 rounded-2xl flex flex-col gap-4'>
        {/* Date Display */}
        <div className='flex flex-col gap-1 items-center justify-center rounded-lg w-14 bg-white'>
          <p className='text-xs font-semibold bg-yellow-200 w-full rounded-t-lg text-center py-1'>
            {weekday[date.getDay()]}
          </p>
          <p className='text-lg font-bold '>{date.getDate()}</p>
        </div>
        {/* Entry Preview */}
        <p className='line-clamp-2'>{entry.Content}</p>
      </article>
    </Link>
  );
}
