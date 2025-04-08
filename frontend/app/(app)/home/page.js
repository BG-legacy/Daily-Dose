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

export default function Page() {
  const { user } = useAuth();
  const { triggerToast } = useToast();
  const [weeklyMoodSummary, setWeeklyMoodSummary] = useState(null);
  const [weeklyJournalSummary, setWeeklyJournalSummary] = useState(null);
  const router = useRouter();

  // Function to load summary data
  async function loadSummaryData() {
    if (user) {
      try {
        const moodSummary = await getWeeklyMoodSummary();
        setWeeklyMoodSummary(moodSummary);
      } catch (error) {
        console.error('Error fetching mood summary:', error);
        triggerToast('An error occurred loading mood data.');
      }
      
      try {
        const journalSummary = await getWeeklyJournalSummary();
        setWeeklyJournalSummary(journalSummary);
      } catch (error) {
        console.error('Error fetching journal summary:', error);
        triggerToast('An error occurred loading journal data.');
      }
    }
  }

  useEffect(() => {
    loadSummaryData();
    
    // Add event listener for focus to refresh data when returning to the page
    const handleFocus = () => {
      loadSummaryData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  return (
    <ProtectedRoute>
      <Layout route='home' className='pb-24'>
        <QuoteCard />
        <Streak weeklyJournalSummary={weeklyJournalSummary} />
        <Chart weeklyMoodSummary={weeklyMoodSummary} />
      </Layout>
    </ProtectedRoute>
  );
}
