import Layout from '../../../components/Layout';

import getQuote from '../../../app/lib/quote';
import { getWeeklyMoodSummary } from '../../../app/lib/mood';
import { getWeeklyJournalSummary } from '../../../app/lib/journal';
import QuoteCard from './QuoteCard';
import JournalCTA from './JournalCTA';
import Chart from './Chart';
import Streak from './Streak';

export default async function Page() {
  const quote = await getQuote({
    userID: 'jan!',
    creationDate: new Date().getUTCDay(),
  });

  const weeklyMoodSummary = await getWeeklyMoodSummary();
  const weeklyJournalSummary = await getWeeklyJournalSummary();

  // todo: get today's journal entry, set true if completed
  // const dailyJournalCompleted = false;
  return (
    <Layout route='home' className='pb-24'>
      <QuoteCard quote={quote} />
      <Streak weeklyJournalSummary={weeklyJournalSummary} />
      {/* {dailyJournalCompleted ? null : <JournalCTA />} */}
      <Chart weeklyMoodSummary={weeklyMoodSummary} />
    </Layout>
  );
}
