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
  const { user } = useAuth();
  const [moodData, setMoodData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMoodData() {
      try {
        const data = await getWeeklyMoodSummary();
        console.log('Fetched mood data:', data); // Debug log
        setMoodData(data);
      } catch (error) {
        console.error('Error fetching mood data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchMoodData();
    }
  }, [user]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: {
            family: 'Inter',
            size: 12
          }
        }
      },
      y: {
        // Hide y-axis but keep scale for mood levels:
        // 3 = Happy (top, yellow)
        // 2 = Sad (middle, blue)
        // 1 = Upset (bottom, red)
        display: false,
        min: 0,
        max: 4,
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // Custom tooltip labels for each mood level
          label: function(context) {
            const value = context.parsed.y;
            if (value === 3) return 'Happy';  // Top level
            if (value === 2) return 'Sad';    // Middle level
            if (value === 1) return 'Upset';  // Bottom level
            return 'No mood logged';
          }
        }
      }
    },
    elements: {
      line: { tension: 0.4 },  // Smooth line between points
      point: { radius: 6 }     // Size of mood indicators
    }
  };

  const data = {
    labels: moodData?.labels || Array(7).fill(''),
    datasets: [{
      label: 'Mood',
      data: moodData?.data || Array(7).fill(null),
      fill: false,
      tension: 0.4,
      segment: {
        // Color the line segments based on the starting point's mood
        borderColor: context => {
          const ctx = context.p0.parsed;
          if (ctx.y === 3) return '#FDD34E';  // Happy - Yellow
          if (ctx.y === 2) return '#4A90E2';  // Sad - Blue
          if (ctx.y === 1) return '#E74C3C';  // Upset - Red
          return '#CCCCCC';  // No mood logged - Gray
        }
      },
      // Color each point based on the mood value
      pointBackgroundColor: context => {
        const value = context.raw;
        if (value === 3) return '#FDD34E';  // Happy - Yellow
        if (value === 2) return '#4A90E2';  // Sad - Blue
        if (value === 1) return '#E74C3C';  // Upset - Red
        return '#CCCCCC';  // No mood logged - Gray
      },
      pointBorderColor: '#FFF',  // White border around points for better visibility
      pointBorderWidth: 2,
      pointHoverRadius: 8,  // Increase point size on hover
    }]
  };

  // Check if we have any mood data
  const hasMoodData = moodData?.data?.some(d => d !== null);

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

  return (
    <motion.section
      {...motionProps(1)}
      className='m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-4'
    >
      <h2 className='font-bold text-xl'>
        Hi, {user?.name ? user?.name : user?.email}!
      </h2>
      <p>
        {hasMoodData
          ? 'Your mood this week:'
          : 'Start tracking your mood to see your overview.'}
      </p>
      <div className={`h-[200px] ${hasMoodData ? '' : 'opacity-50'}`}>
        <Line options={options} data={data} />
      </div>
    </motion.section>
  );
}
