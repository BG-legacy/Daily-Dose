'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/authContext/authIndex';
import Layout from '../../../../components/Layout';
import AI from '../../../../public/assets/brand/AI.png';
import Image from 'next/image';
import { getEntry } from '../../../lib/journal';
import { use } from 'react';
import {
  MaterialSymbolsFlag,
  MaterialSymbolsThumbDown,
  MaterialSymbolsThumbUp,
} from '../../../../components/Icons';

/**
 * Array of weekday abbreviations for date display
 * @constant {string[]}
 */
const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];

/**
 * Journal Entry Page Component
 * Displays a single journal entry with AI-generated insights
 *
 * @param {Object} props - Component props
 * @param {Object} props.params - URL parameters
 * @param {string} props.params.id - Journal entry ID
 */
export default function Page({ params }) {
  // State management
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);

  // Fetch entry data on component mount
  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    /**
     * Fetches journal entry data from the API
     */
    const fetchEntry = async () => {
      try {
        const decodedId = decodeURIComponent(resolvedParams.id);
        console.log('Fetching entry:', decodedId);
        const data = await getEntry({ entryID: decodedId });
        console.log('Received entry:', data);
        if (!data) {
          throw new Error('Entry not found');
        }
        setEntry(data);
      } catch (err) {
        console.error('Error loading entry:', err);
        setError(err.message || 'Failed to load entry');
      }
    };

    fetchEntry();
  }, [resolvedParams.id, user, router]);

  // Error state UI
  if (error) {
    return (
      <Layout route='journal'>
        <div className='p-6 text-center'>
          <p className='text-red-500'>{error}</p>
          <button
            onClick={() => router.push('/journal')}
            className='mt-4 px-4 py-2 bg-yellow-950 text-white rounded-full'
          >
            Back to Journal
          </button>
        </div>
      </Layout>
    );
  }

  // Loading state UI
  if (!entry) {
    return (
      <Layout route='journal'>
        <div className='p-6 text-center'>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  // Parse entry date
  const date = new Date(entry.CreationDate);

  // Main content UI
  return (
    <Layout route='journal'>
      <section className='flex flex-col gap-6 p-6 py-40'>
        {/* Journal Entry Card */}
        <article className='bg-white rounded-lg p-6 shadow-sm'>
          <div className='flex flex-col gap-4'>
            {/* Date Display */}
            <div className='flex flex-col gap-1 items-center justify-center rounded-lg w-14 bg-white border'>
              <p className='text-xs font-semibold bg-yellow-200 w-full rounded-t-lg text-center py-1'>
                {weekday[date.getDay()]}
              </p>
              <p className='text-lg font-bold'>{date.getDate()}</p>
            </div>
            {/* Entry Content */}
            <div className='prose max-w-none'>
              <p className='whitespace-pre-wrap'>{entry.Content}</p>
            </div>
          </div>
        </article>

        {/* AI Insights Card */}
        <div className='bg-white rounded-lg p-6 shadow-sm'>
          <div className='flex gap-2 font-semibold text-lg mb-4 items-center'>
            <Image
              src={AI}
              alt='Daily Dose AI Emoticon'
              className='w-14 h-14 object-contain'
            />
            <h2 className='text-xl'>AI Insights</h2>
          </div>
          <div className='space-y-4'>
            {/* Mental Health Tip */}
            <div>
              <h3 className='text-lg font-medium mb-2'>Mental Health Tip</h3>
              <p>{entry.MentalHealthTip}</p>
            </div>
            {/* Productivity Hack */}
            <div>
              <h3 className='text-lg font-medium mb-2'>Productivity Hack</h3>
              <p>{entry.Hack}</p>
            </div>
            {/* Inspirational Quote */}
            <div>
              <h3 className='text-lg font-medium mb-2'>Quote</h3>
              <p className='italic'>&quot;{entry.Quote}&quot;</p>
            </div>
          </div>
        </div>

        {/* AI Insights Feedback */}
        <div className='px-6 flex justify-between text-neutral-400'>
          <div className='flex gap-2 items-center'>
            <p>Rate Feedback</p>
            <MaterialSymbolsThumbUp />
            <MaterialSymbolsThumbDown />
          </div>
          <div className='flex gap-2 items-center'>
            <MaterialSymbolsFlag />
            <p>Report Feedback</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
