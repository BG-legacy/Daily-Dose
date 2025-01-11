'use client';
import Layout from '../../../components/Layout';
import { useState, useEffect } from 'react';

import getQuote from '../../../app/lib/quote';
import { getWeeklyMoodSummary } from '../../../app/lib/mood';
import { getWeeklyJournalSummary } from '../../../app/lib/journal';
import QuoteCard from './QuoteCard';
import JournalCTA from './JournalCTA';
import Chart from './Chart';
import Streak from './Streak';

import { useAuth } from '../../contexts/authContext/authIndex';
import { useToast } from '../../contexts/toastContext/toastContext';

export default function Page() {
  const { user } = useAuth();
  const { triggerToast } = useToast();
  const [weeklyMoodSummary, setWeeklyMoodSummary] = useState(null);
  const [weeklyJournalSummary, setWeeklyJournalSummary] = useState(null);
  // const quote = await getQuote({
  //   userID: 'jan!',
  //   creationDate: new Date().getUTCDay(),
  // });

  useEffect(() => {
    getWeeklyMoodSummary()
      .catch((error) => triggerToast('An error occurred.'))
      .then((res) => setWeeklyMoodSummary(res));
    getWeeklyJournalSummary()
      .catch((error) => triggerToast('An error occurred.'))
      .then((res) => setWeeklyJournalSummary(res));
  }, []);

  // todo: get today's journal entry, set true if completed
  // const dailyJournalCompleted = false;
  return (
    <Layout route='home' className='pb-24 pt-32'>
      {/* <QuoteCard quote={quote} /> */}

      {/* <Streak weeklyJournalSummary={weeklyJournalSummary} /> */}
      {/* {dailyJournalCompleted ? null : <JournalCTA />} */}
      {weeklyJournalSummary != null && (
        <Chart weeklyMoodSummary={weeklyMoodSummary} />
      )}
    </Layout>
  );
}
