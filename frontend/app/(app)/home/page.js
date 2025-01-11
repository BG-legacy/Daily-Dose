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

export default function Page() {
  const { user } = useAuth();
  const [weeklyMoodSummary, setWeeklyMoodSummary] = useState(null);
  const [weeklyJournalSummary, setWeeklyJournalSummary] = useState(null);
  // const quote = await getQuote({
  //   userID: 'jan!',
  //   creationDate: new Date().getUTCDay(),
  // });

  useEffect(() => {
    getWeeklyMoodSummary().then((res) => setWeeklyMoodSummary(res));
    getWeeklyJournalSummary().then((res) => setWeeklyJournalSummary(res));
  }, []);

  // todo: get today's journal entry, set true if completed
  // const dailyJournalCompleted = false;
  return (
    <Layout route='home' className='pb-24 pt-32'>
      {/* <QuoteCard quote={quote} /> */}

      {/* <Streak weeklyJournalSummary={weeklyJournalSummary} /> */}
      {/* {dailyJournalCompleted ? null : <JournalCTA />} */}
      {weeklyJournalSummary && <Chart weeklyMoodSummary={weeklyMoodSummary} />}
    </Layout>
  );
}
