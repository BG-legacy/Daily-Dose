'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import Layout from '../../../components/Layout';
import Image from 'next/image';
import { MaterialSymbolsSwipeRounded } from '../../../components/Icons';

import halo from '../../../public/assets/media/halo.png';

import happy from '../../../public/assets/brand/Happy.png';
import sad from '../../../public/assets/brand/Sad.png';
import upset from '../../../public/assets/brand/Upset.png';
import { motionProps } from '../../utils/motion';
import GestureHint from '../../../components/GestureHint';

import { useAuth } from '../../contexts/authContext/authIndex';
import { useToast } from '../../contexts/toastContext/toastContext';

import { setMood as setUserMood } from '../../lib/mood';
import Link from 'next/link';

export default function Page() {
  // Authentication and state management hooks
  const { user } = useAuth();                                    // Get current authenticated user
  const [mood, setMood] = useState('happy');                     // Track selected mood state
  const [showGestureHint, setShowGestureHint] = useState(true); // Control gesture hint visibility
  const [ui, setUi] = useState('initial');                       // Toggle between initial form and success view
  const { triggerToast } = useToast();                          // Toast notification handler
  const [weeklyMoodSummary, setWeeklyMoodSummary] = useState(null); // Store weekly mood data
  const [submissionMessage, setSubmissionMessage] = useState('Mood Logged!'); // Dynamic submission feedback

  // Fetch weekly mood summary when component mounts
  useEffect(() => {
    if (user) {
      const token = sessionStorage.getItem('token');
      // Make API call to get weekly mood summary
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mood/summary/weekly`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setWeeklyMoodSummary(data);
          // Set initial mood based on user's last recorded mood
          if (data.data && data.data[data.data.length - 1]) {
            const lastMoodValue = data.data[data.data.length - 1];
            // Map backend numerical values to mood strings
            const moodMap = {
              3: 'happy',
              2: 'sad',
              1: 'upset',
            };
            setMood(moodMap[lastMoodValue] || 'happy');
          }
        })
        .catch((err) => console.error('Error fetching mood summary:', err));
    }
  }, [user]); // Re-run when user changes (login/logout)

  // Check if user has already submitted a mood for today
  useEffect(() => {
    const now = new Date().getDay();
    const moodMap = {
      3: 'happy',
      2: 'sad',
      1: 'upset',
    };
    // If mood exists for today, update UI accordingly
    if (weeklyMoodSummary?.data[now]) {
      setMood(moodMap[weeklyMoodSummary.data[now]]);
      setSubmissionMessage('Today\'s mood is already set. You can update it if you\'d like.');
      setUi('submitted');
    }
  }, [weeklyMoodSummary]);

  // Handle mood submission or update
  function handleSubmitEntry(isUpdate = false) {
    const token = sessionStorage.getItem('token');
    // Check for authentication
    if (!token) {
      triggerToast('Please log in to submit your mood');
      return;
    }

    // Validate mood value
    const validMoods = ['happy', 'sad', 'upset'];
    if (!validMoods.includes(mood)) {
      triggerToast('Invalid mood value selected');
      return;
    }

    // Submit mood to backend
    setUserMood({ content: mood })
      .then((res) => {
        if (!res) {
          throw new Error('No response from server');
        }
        console.log('Mood submission response:', res);
        
        // Update UI state and message based on response
        const message = res.wasUpdated ? 'Mood Updated Successfully!' : 'Mood Logged Successfully!';
        setSubmissionMessage(message);
        setUi('submitted');
        
        // Refresh mood summary data
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mood/summary/weekly`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setWeeklyMoodSummary(data);
        // Trigger chart refresh if available
        if (window.refreshMoodChart) {
          window.refreshMoodChart();
        }
        // Show success toast
        triggerToast(submissionMessage);
      })
      .catch((error) => {
        console.error('Error submitting mood:', error);
        triggerToast('Failed to update mood. Please try again.');
        // Reset UI state on error
        setUi('initial');
      });
  }

  // Update the change mood button handler
  const handleChangeMood = () => {
    setMood('happy');
    setUi('initial');
    setSubmissionMessage('Mood Logged!');
  };

  return (
    <Layout route='mood' fullWidth onClick={() => setShowGestureHint(false)}>
      <section className='w-full h-svh grid relative pointer-events-none'>
        {/* Initial mood selection UI */}
        {ui === 'initial' && (
          <div className='w-full h-full flex flex-col justify-center items-center col-end-1 row-end-1 z-20'>
            <div className='flex flex-col gap-8 justify-center items-center pointer-events-auto'>
              {/* Mood question prompt */}
              <motion.p
                {...motionProps(0)}
                className='font-bold items-center justify-center text-pretty text-center text-lg'
              >
                How was your <b>mood</b> today?
              </motion.p>

              {/* Mood selection slider */}
              <Slider mood={mood} setMood={setMood} />

              {/* Submit button */}
              <motion.button
                {...motionProps(2)}
                className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
                onClick={() => handleSubmitEntry(false)}
              >
                Submit
              </motion.button>
            </div>
          </div>
        )}

        {/* Success/confirmation UI */}
        {ui === 'submitted' && (
          <motion.div
            className='flex justify-center flex-col items-center gap-5 col-end-1 row-end-1 z-30 relative pointer-events-auto'
            {...motionProps(0)}
          >
            {/* Display selected mood emoticon */}
            <Image
              src={
                mood === 'happy'
                  ? happy
                  : mood === 'sad'
                    ? sad
                    : mood === 'upset'
                      ? upset
                      : null
              }
              alt='Daily Dose Dynamic Emoticon'
              className='w-14 h-14'
              priority
            />
            {/* Success message */}
            <h1 className='font-bold text-xl'>{submissionMessage}</h1>
            {/* Navigation buttons */}
            <div className='flex gap-2'>
              <motion.button
                {...motionProps(1)}
                className='border-yellow-950 border-2 bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
              >
                <Link href={'/home'}>Go Home &rarr;</Link>
              </motion.button>
              <motion.button
                {...motionProps(2)}
                className='border-yellow-950 border-2 px-6 py-4 font-bold rounded-full'
                onClick={handleChangeMood}
              >
                Change Mood
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Background halo image with mood-based color adjustments */}
        <div className='fade-in col-end-1 row-end-1 w-full h-full overflow-hidden z-0 relative pointer-events-none'>
          <Image
            src={halo}
            alt=''
            className={`object-cover h-full w-full scale-125 z-0 transition-all duration-300 ${
              mood === 'sad' ? 'hue-rotate-[160deg]' : ''
            } ${mood === 'upset' ? 'hue-rotate-[-30deg]' : ''}`}
          />
        </div>

        {/* Gesture hint overlay */}
        <div className='absolute top-0 left-0 right-0 bottom-0 radial-gradient z-10 pointer-events-none'>
          {ui === 'initial' && (
            <GestureHint
              showGestureHint={showGestureHint}
              setShowGestureHint={setShowGestureHint}
              top={60}
            >
              <MaterialSymbolsSwipeRounded className='w-8 h-8 text-yellow-950/20 animate-pulse' />
            </GestureHint>
          )}
        </div>
      </section>
    </Layout>
  );
}

// Slider component for mood selection
function Slider({ setMood }) {
  const [sliderIndex, setSliderIndex] = useState(1);
  const sliderLength = 3;
  const dragX = useMotionValue(0);

  // Handle drag gesture completion
  const onDragEnd = () => {
    const x = dragX.get();

    // Update slider index based on drag direction and buffer
    if (x <= -DRAG_BUFFER && sliderIndex < sliderLength - 1) {
      setSliderIndex((pv) => pv + 1);
    } else if (x >= DRAG_BUFFER && sliderIndex > 0) {
      setSliderIndex((pv) => pv - 1);
    }

    updateState();
  };

  // Update mood state based on slider position
  function updateState() {
    if (sliderIndex === 0) setMood('sad');
    if (sliderIndex === 1) setMood('happy');
    if (sliderIndex === 2) setMood('upset');
  }
  return (
    <div className='max-w-[100vw] flex justify-center items-center relative h-72 overflow-x-hidden overflow-y-visible gradient-mask'>
      <motion.div
        drag='x'
        dragConstraints={{
          left: 0,
          right: 0,
        }}
        style={{
          x: dragX,
        }}
        animate={{
          translateX: `-${sliderIndex * 320}px`,
        }}
        onDragEnd={onDragEnd}
        transition={SPRING_OPTIONS}
        className='cursor-grab active:cursor-grabbing flex gap-32 ml-[640px] h-64'
      >
        <div
          onClick={() => {
            setSliderIndex(0);
            setMood('sad');
          }}
          className={`cursor-pointer pointer-events-none md:pointer-events-auto w-52 h-52 transition-all relative ${sliderIndex === 0 ? '' : 'translate-y-12'
            }`}
        >
          <Image
            src={sad}
            alt='Daily Dose Happy Emoticon'
            className='min-w-52 min-h-52 pointer-events-none'
          />
        </div>
        <div
          onClick={() => {
            setSliderIndex(1);
            setMood('happy');
          }}
          className={`cursor-pointer pointer-events-none md:pointer-events-auto w-52 h-52 transition-all ${sliderIndex === 1 ? '' : 'translate-y-12'
            }`}
        >
          <Image
            src={happy}
            alt='Daily Dose Happy Emoticon'
            className='min-w-52 min-h-52 pointer-events-none'
          />
        </div>
        <div
          onClick={() => {
            setSliderIndex(2);
            setMood('upset');
          }}
          className={`cursor-pointer pointer-events-none md:pointer-events-auto w-52 h-52 transition-all ${sliderIndex === 2 ? '' : 'translate-y-12'
            }`}
        >
          <Image
            src={upset}
            alt='Daily Dose Upset Emoticon'
            className='min-w-52 min-h-52 pointer-events-none'
          />
        </div>
      </motion.div>
    </div>
  );
}

// Constants for drag interaction
const DRAG_BUFFER = 50; // Minimum drag distance to trigger slider movement

// Animation spring configuration
const SPRING_OPTIONS = {
  type: 'spring',
  mass: 3,
  stiffness: 400,
  damping: 50,
};
