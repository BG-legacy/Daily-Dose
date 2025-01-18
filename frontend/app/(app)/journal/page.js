'use client';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { getAllJournalEntries } from '../../lib/journal';
import JournalInput from './JournalInput';
import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/toastContext/toastContext';

export default function Page() {
  const [journalEntries, setJournalEntries] = useState(null);
  const { triggerToast } = useToast();
  const [showGestureHint, setShowGestureHint] = useState(true);
  useEffect(() => {
    getAllJournalEntries()
      .catch((error) => triggerToast('An error occurred.'))
      .then((res) => setJournalEntries(res));
  }, []);

  return (
    <Layout route='journal' onClick={() => setShowGestureHint(false)}>
      <JournalInput
        showGestureHint={showGestureHint}
        setShowGestureHint={setShowGestureHint}
      />
      <section className='grid grid-cols-2 gap-5 p-6 pb-32'>
        <h2 className='col-span-2 font-semibold text-lg'>Past Entries</h2>

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

const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

function EntryCard({ entry }) {
  const date = new Date(entry.date);
  return (
    <Link href={`/journal/${entry.id}`}>
      <article className='p-6 bg-neutral-100/50 rounded-2xl flex flex-col gap-4'>
        <div className='flex flex-col gap-1 items-center justify-center rounded-lg w-14 bg-white'>
          <p className='text-xs font-semibold bg-yellow-200 w-full rounded-t-lg text-center py-1'>
            {weekday[date.getDay()]}
          </p>
          <p className='text-lg font-bold '>{date.getDate()}</p>
        </div>
        <p className='line-clamp-2'>{entry.content}</p>
      </article>
    </Link>
  );
}
