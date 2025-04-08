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
    console.log('Loading summary data...');
    if (user) {
      console.log('User authenticated, fetching data');
      try {
        const moodSummary = await getWeeklyMoodSummary();
        console.log('Mood summary data:', moodSummary);
        setWeeklyMoodSummary(moodSummary);
      } catch (error) {
        console.error('Error fetching mood summary:', error);
        triggerToast('An error occurred loading mood data.');
      }
      
      try {
        console.log('Fetching journal summary...');
        const journalSummary = await getWeeklyJournalSummary();
        console.log('Journal summary received:', journalSummary);
        
        // Log today's data specifically
        const today = new Date().getDay();
        console.log('Today is day:', today);
        if (journalSummary?.summary) {
          console.log('Today has entry:', journalSummary.summary[today]);
        }
        
        setWeeklyJournalSummary(journalSummary);
      } catch (error) {
        console.error('Error fetching journal summary:', error);
        triggerToast('An error occurred loading journal data.');
      }
    } else {
      console.log('No user, cannot fetch data');
    }
  }

  useEffect(() => {
    console.log('Home page mounted or user changed');
    loadSummaryData();
    
    // Add event listener for focus to refresh data when returning to the page
    const handleFocus = () => {
      console.log('Window focused, refreshing data');
      loadSummaryData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Force update when the page is visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing data');
        loadSummaryData();
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
        <QuoteCard />
        <Streak weeklyJournalSummary={weeklyJournalSummary} />
        <Chart weeklyMoodSummary={weeklyMoodSummary} />
      </Layout>
    </ProtectedRoute>
  );
}
