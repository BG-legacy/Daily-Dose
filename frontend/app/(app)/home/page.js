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
import { useRouter } from 'next/navigation';
import JournalCTA from './JournalCTA';

export default function Page() {
  const { user } = useAuth();
  const { triggerToast } = useToast();
  const [weeklyMoodSummary, setWeeklyMoodSummary] = useState(null);
  const [weeklyJournalSummary, setWeeklyJournalSummary] = useState(null);
  const router = useRouter();

  // Function to refresh all data
  const refreshData = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch mood summary
      const moodData = await getWeeklyMoodSummary();
      setWeeklyMoodSummary(moodData);

      // Fetch journal summary
      const journalData = await getWeeklyJournalSummary();
      setWeeklyJournalSummary(journalData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, []);

  // Expose refresh function to window
  useEffect(() => {
    window.refreshHomeData = refreshData;
    return () => {
      delete window.refreshHomeData;
    };
  }, []);

  // Force update when the page is visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing data');
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <ProtectedRoute>
      <Layout route='home' className='pb-24'>
        <div className='flex flex-col gap-4'>
          <Streak 
            weeklyJournalSummary={weeklyJournalSummary} 
            weeklyMoodSummary={weeklyMoodSummary} 
          />
          <Chart 
            weeklyJournalSummary={weeklyJournalSummary} 
            weeklyMoodSummary={weeklyMoodSummary} 
          />
          <QuoteCard />
          <JournalCTA />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
