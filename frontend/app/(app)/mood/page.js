'use client';
import { useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'motion/react';
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
  const { user } = useAuth();
  const [mood, setMood] = useState('happy');
  const [showGestureHint, setShowGestureHint] = useState(true);
  const [ui, setUi] = useState('initial');
  const { triggerToast } = useToast();

  function handleSubmitEntry() {
    setUserMood({ content: mood })
      .catch((error) => triggerToast('An error occurred.'))
      .then((res) => setUi('submitted'));
  }

  return (
    <Layout route='mood' fullWidth onClick={() => setShowGestureHint(false)}>
      <section className='w-full h-svh grid relative pointer-events-none'>
        <div className='w-full h-full flex flex-col justify-center items-center col-end-1 row-end-1 z-20'>
          {ui === 'initial' && (
            <div className='flex flex-col gap-8 justify-center items-center pointer-events-auto'>
              <motion.p
                {...motionProps(0)}
                className='font-bold items-center justify-center text-pretty text-center text-lg'
              >
                How was your <b>mood</b> today?
              </motion.p>

              <Slider mood={mood} setMood={setMood} />

              <motion.button
                {...motionProps(2)}
                className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
                onClick={handleSubmitEntry}
              >
                Submit
              </motion.button>
            </div>
          )}
        </div>
        <AnimatePresence>
          {ui === 'submitted' && (
            <motion.div
              className='flex justify-center flex-col items-center gap-5 col-end-1 row-end-1 z-20'
              {...motionProps(0)}
            >
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
              />
              <h1 className='font-bold text-xl'>Mood logged!</h1>
              <motion.button
                {...motionProps(1)}
                className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
              >
                <Link href={'/home'}>Go Home &rarr;</Link>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='fade-in col-end-1 row-end-1 w-full h-full overflow-hidden z-0 relative pointer-events-none'>
          <Image
            src={halo}
            alt=''
            className={`object-cover h-full w-full scale-125 z-0 transition-all ${
              mood === 'sad' ? 'hue-rotate-[160deg]' : ''
            } ${mood === 'upset' ? 'hue-rotate-[-30]' : ''}`}
          />
        </div>

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

function Slider({ setMood }) {
  const [sliderIndex, setSliderIndex] = useState(1);
  const sliderLength = 3;

  const dragX = useMotionValue(0);

  const onDragEnd = () => {
    const x = dragX.get();

    if (x <= -DRAG_BUFFER && sliderIndex < sliderLength - 1) {
      setSliderIndex((pv) => pv + 1);
    } else if (x >= DRAG_BUFFER && sliderIndex > 0) {
      setSliderIndex((pv) => pv - 1);
    }

    updateState();
  };

  function updateState() {
    if (sliderIndex === 0) setMood('sad');
    if (sliderIndex === 1) setMood('happy');
    if (sliderIndex === 2) setMood('stressed');
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
          className={`cursor-pointer pointer-events-none md:pointer-events-auto w-52 h-52 transition-all relative ${
            sliderIndex === 0 ? '' : 'translate-y-12'
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
          className={`cursor-pointer pointer-events-none md:pointer-events-auto w-52 h-52 transition-all ${
            sliderIndex === 1 ? '' : 'translate-y-12'
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
          className={`cursor-pointer pointer-events-none md:pointer-events-auto w-52 h-52 transition-all ${
            sliderIndex === 2 ? '' : 'translate-y-12'
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

const DRAG_BUFFER = 50;

const SPRING_OPTIONS = {
  type: 'spring',
  mass: 3,
  stiffness: 400,
  damping: 50,
};
