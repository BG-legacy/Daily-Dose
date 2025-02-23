'use client';
import { motion } from 'motion/react';
import { motionProps } from '../../utils/motion';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../../contexts/authContext/authIndex';
import { useEffect, useState } from 'react';
import { getWeeklyMoodSummary } from '../../lib/mood';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const sampleSummary = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 2,
  Friday: 2,
  Saturday: 2,
  Sunday: 3,
};

export default function Chart() {
  // Get authenticated user from the auth context
  const { user } = useAuth();
  
  // State management for mood data, loading state, and update trigger
  const [moodData, setMoodData] = useState(null);    // Stores the weekly mood data
  const [loading, setLoading] = useState(true);      // Tracks loading state during API calls
  const [lastUpdate, setLastUpdate] = useState(Date.now());  // Timestamp for chart refresh

  // Effect hook to fetch mood data when component mounts or updates
  useEffect(() => {
    async function fetchMoodData() {
      // Don't fetch if no user is authenticated
      if (!user) return;
      
      try {
        setLoading(true);  // Start loading state
        const data = await getWeeklyMoodSummary();  // Fetch mood data from API
        console.log('Fetched mood data:', data);    // Debug log
        setMoodData(data);  // Update state with fetched data
      } catch (error) {
        console.error('Error fetching mood data:', error);  // Log any errors
      } finally {
        setLoading(false);  // End loading state regardless of outcome
      }
    }

    fetchMoodData();  // Execute the fetch function
  }, [user, lastUpdate]);  // Re-run effect when user or lastUpdate changes

  // Function to manually trigger a data refresh
  const refreshChart = () => {
    setLastUpdate(Date.now());  // Update timestamp to trigger useEffect
  };

  // Chart configuration options
  const options = {
    responsive: true,  // Make chart responsive to container size
    maintainAspectRatio: false,  // Allow chart to adjust height independently
    scales: {
      x: {
        grid: { display: false },  // Hide x-axis grid lines
        ticks: {
          font: {
            family: 'Inter',  // Set x-axis label font
            size: 12
          }
        }
      },
      y: {
        display: false,  // Hide y-axis
        min: 0,         // Set minimum value
        max: 4,         // Set maximum value
        grid: { display: false }  // Hide y-axis grid lines
      }
    },
    plugins: {
      legend: { display: false },  // Hide chart legend
      tooltip: {
        callbacks: {
          // Convert numerical mood values to text labels in tooltips
          label: function(context) {
            const value = context.parsed.y;
            if (value === 3) return 'Happy';
            if (value === 2) return 'Sad';
            if (value === 1) return 'Upset';
            return 'No mood logged';
          }
        }
      }
    },
    elements: {
      line: { tension: 0.4 },  // Add curve to the line
      point: { radius: 6 }     // Set size of mood indicators
    }
  };

  // Chart data configuration
  const data = {
    // Use provided day labels or empty array if no data available
    labels: moodData?.labels || Array(7).fill(''),
    datasets: [{
      label: 'Mood',
      data: moodData?.data || Array(7).fill(null),  // Use mood data or null placeholder
      fill: false,  // Don't fill area under the line
      tension: 0.4, // Match line tension with options
      segment: {
        // Set line segment colors based on mood values
        borderColor: context => {
          const ctx = context.p0.parsed;
          if (ctx.y === 3) return '#FDD34E';  // Happy - Yellow
          if (ctx.y === 2) return '#4A90E2';  // Sad - Blue
          if (ctx.y === 1) return '#E74C3C';  // Upset - Red
          return '#CCCCCC';  // No mood logged - Gray
        }
      },
      // Set point colors based on mood values
      pointBackgroundColor: context => {
        const value = context.raw;
        if (value === 3) return '#FDD34E';  // Happy - Yellow
        if (value === 2) return '#4A90E2';  // Sad - Blue
        if (value === 1) return '#E74C3C';  // Upset - Red
        return '#CCCCCC';  // No mood logged - Gray
      },
      pointBorderColor: '#FFF',      // White border around points
      pointBorderWidth: 2,           // Point border thickness
      pointHoverRadius: 8,           // Enlarged point size on hover
    }]
  };

  // Check if there's any non-null mood data to display
  const hasMoodData = moodData?.data?.some(d => d !== null);

  // Show loading state while fetching data
  if (loading) {
    return (
      <motion.section
        {...motionProps(1)}
        className='m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-4'
      >
        <p>Loading mood data...</p>
      </motion.section>
    );
  }

  // Render the chart component
  return (
    <motion.section
      {...motionProps(1)}
      className='m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-4'
    >
      {/* Display user's name or email */}
      <h2 className='font-bold text-xl'>
        Hi, {user?.name ? user?.name : user?.email}!
      </h2>
      {/* Show appropriate message based on data availability */}
      <p>
        {hasMoodData
          ? 'Your mood this week:'
          : 'Start tracking your mood to see your overview.'}
      </p>
      {/* Chart container with conditional opacity */}
      <div className={`h-[200px] ${hasMoodData ? '' : 'opacity-50'}`}>
        <Line options={options} data={data} />
      </div>
    </motion.section>
  );
}
