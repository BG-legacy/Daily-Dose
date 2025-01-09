import Layout from '../../../components/Layout'

import getQuote from '../../../app/lib/quote'
import { getWeeklySummary } from '../../../app/lib/mood'
import QuoteCard from './QuoteCard'
import JournalCTA from './JournalCTA'
import Chart from './Chart'

export default async function Page() {
  const quote = await getQuote({
    userID: 'jan!', creationDate: (new Date()).getUTCDay()
  })

  const weeklySummary = await getWeeklySummary()


  // todo: get today's journal entry, set true if completed
  const dailyJournalCompleted = false
  return (
    <Layout route='home' className='pb-24'>
      <QuoteCard quote={quote} />
      {dailyJournalCompleted ? null : <JournalCTA />}
      <Chart weeklySummary={weeklySummary} />
    </Layout>
  )
}
