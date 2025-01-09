'use client'
import { motion } from "motion/react"
import { motionProps } from "../../utils/motion"
import Link from "next/link"
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Chart({ weeklyMoodSummary }) {
  const options = {
    responsive: true,
    borderColor: "#FDD34E",
    borderWidth: 4,
    cubicInterpolationMode: 'monotone',
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const data = {
    datasets: [
      {
        label: 'Dataset 1',
        data: weeklyMoodSummary,
      },
    ],
  };

  let name = 'User'
  return (
    <motion.section {...motionProps(1)} className="m-6 p-8 bg-neutral-100/20 rounded-2xl flex flex-col gap-4">
      <h2 className="font-bold text-xl">Stellar Week, {name}!</h2>
      <p>Your mood has been great this week.</p>
      <div><Line options={options} data={data} /></div>
      <Link href={'/mood'} className="font-semibold">See Mood Entries &rarr;</Link>
    </motion.section>
  )
}

