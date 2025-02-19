'use client';
import Layout from '../../../components/Layout';
import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { getWeeklyMoodSummary } from '../../../app/lib/mood';
import { getWeeklyJournalSummary } from '../../../app/lib/journal';
import QuoteCard from './QuoteCard';
import Chart from './Chart';
import Streak from './Streak';
import HealthCheck from '../../components/HealthCheck';
import { useAuth } from '../../contexts/authContext/authIndex';
import { useToast } from '../../contexts/toastContext/toastContext';

export default function Page() {
  const { user } = useAuth();
  const { triggerToast } = useToast();
  const [weeklyMoodSummary, setWeeklyMoodSummary] = useState(null);
  const [weeklyJournalSummary, setWeeklyJournalSummary] = useState(null);

  useEffect(() => {
    if (user) {
      getWeeklyMoodSummary()
        .catch((error) => triggerToast('An error occurred.'))
        .then((res) => setWeeklyMoodSummary(res));
      getWeeklyJournalSummary()
        .catch((error) => triggerToast('An error occurred.'))
        .then((res) => setWeeklyJournalSummary(res));
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <Layout route='home' className='pb-24'>
        <QuoteCard quote={{ quote: 'Be the change you want to see.' }} />
        <Streak weeklyJournalSummary={weeklyJournalSummary} />
        <Chart weeklyMoodSummary={weeklyMoodSummary} />
      </Layout>
    </ProtectedRoute>
  );
}
