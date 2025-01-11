'use client';
import Image from 'next/image';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';

import { scrollInProps as motionProps } from './utils/motion.js';

import happy from '../public/assets/brand/Happy.png';
import Link from 'next/link';

import sad from '../public/assets/brand/Sad.png';
import upset from '../public/assets/brand/Upset.png';
import uncertain from '../public/assets/brand/Uncertain.png';
import fire from '../public/assets/brand/Fire.png';
import moods from '../public/assets/brand/Moods.png';
import ai from '../public/assets/brand/AI.png';

import aboutImage from '../public/assets/media/canon.jpg';
import ImageRotator from '../components/ImageRotator';

import { useAuth } from './contexts/authContext/authIndex.js';

export default function Home() {
  const [currentText, setCurrentText] = useState('Gloomy Days');
  const [currentEmoticon, setCurrentEmoticon] = useState(sad);

  const { user } = useAuth();

  const constraintsRef = useRef(null);

  return (
    <div className='tracking-tight'>
      <header className='justify-between flex fixed container mx-auto left-0 right-0 items-center top-16 text-yellow-950 px-12 md:p-0 z-30'>
        <motion.p {...motionProps(0)}>
          <Link
            href={'/'}
            className='flex gap-2 items-center leading-none font-extrabold'
          >
            <Image src={happy} alt='Daily Dose Logo' width='42' height='42' />
            <span>
              Daily
              <br />
              Dose
            </span>
          </Link>
        </motion.p>
        <div className='flex items-center gap-8 font-bold'>
          <motion.p
            {...motionProps(1)}
            className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'
          >
            <Link href={'/'}>Home</Link>
          </motion.p>
          <motion.p
            {...motionProps(2)}
            className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'
          >
            <Link href={'#features'}>Features</Link>
          </motion.p>
          <motion.p
            {...motionProps(3)}
            className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'
          >
            <Link href={'#about'}>About</Link>
          </motion.p>
          {user != null ? (
            <motion.p {...motionProps(4)}>
              <Link
                href={'/home'}
                className='bg-white text-yellow-950 px-6 py-4 font-bold rounded-full hover:bg-yellow-950 hover:text-white transition-colors duration-300 ease-in-out'
              >
                Dashboard
              </Link>
            </motion.p>
          ) : (
            <motion.p {...motionProps(4)}>
              <Link
                href={'/register'}
                className='bg-white text-yellow-950 px-6 py-4 font-bold rounded-full hover:bg-yellow-950 hover:text-white transition-colors duration-300 ease-in-out'
              >
                Sign Up
              </Link>
            </motion.p>
          )}
        </div>
      </header>
      <main ref={constraintsRef} className='relative overflow-x-hidden'>
        {/* Emoticons */}
        <motion.div
          drag
          draggable
          dragElastic
          dragConstraints={constraintsRef}
          className='absolute -left-12 md:-left-20 top-48 md:top-60 w-36 h-36 md:w-52 md:h-52 z-20 cursor-grab active:cursor-grabbing'
        >
          <Image
            src={happy}
            alt='Daily Dose Happy Emoticon'
            className='w-36 h-36 md:w-52 md:h-52 rotate-[30deg] pointer-events-none'
          />
        </motion.div>
        <motion.div
          className='absolute -right-12 md:-right-48 top-72 w-32 h-32 md:w-96 md:h-96 z-20 cursor-grab active:cursor-grabbing'
          drag
          draggable
          dragElastic
          dragConstraints={constraintsRef}
        >
          <Image
            src={sad}
            alt='Daily Dose Sad Emoticon'
            className='w-32 h-32 md:w-96 md:h-96 -rotate-12 pointer-events-none'
          />
        </motion.div>
        <section className='grid w-full px-6 mt-6'>
          <div className='col-end-1 row-end-1 z-10 w-full flex flex-col justify-end items-center gap-3 text-yellow-950 py-12 bg-gradient-to-t from-white/40 via-transparent to-white/40 rounded-2xl'>
            <h1 className='flex flex-col items-center gap-1'>
              <span>
                A <b>Daily Dose</b> of <b>Wellness</b> for
              </span>
              <span
                className='inline-flex items-center gap-2 font-bold text-3xl hero-text'
                id='hero-text'
              >
                {currentText}
                <Image
                  alt='Dynamic Mood Emoticon'
                  src={currentEmoticon}
                  width={120}
                  height={120}
                  className='w-12 h-12'
                />
              </span>
            </h1>
            {user != null ? (
              <Link
                href={'/home'}
                className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full hover:bg-[#6D533F] transition-colors duration-300 ease-in-out'
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href={'/register'}
                className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full hover:bg-[#6D533F] transition-colors duration-300 ease-in-out'
              >
                Get Started
              </Link>
            )}
          </div>
          <ImageRotator
            setCurrentText={setCurrentText}
            setCurrentEmoticon={setCurrentEmoticon}
          />{' '}
          {/*image rotator/flipper component */}
        </section>
        <section
          id='features'
          className='py-12 px-6 container mx-auto md:grid-cols-3 grid gap-6'
        >
          <motion.div className='flex flex-col gap-3 px-6' {...motionProps(0)}>
            <Image
              className='w-24 h-24 object-contain'
              src={fire}
              alt='Daily Dose Fire Emoticon'
            />
            <h2 className='font-bold text-2xl'>
              Inspiration at Your Fingertips
            </h2>
            <p>
              Receive daily curated quotes, tips, and hacks to uplift your day.
            </p>
          </motion.div>
          <motion.div
            className='flex flex-col gap-3 border-x-neutral-950/10 border-y md:border-y-0 md:border-x py-6 md:py-0 px-6'
            {...motionProps(1)}
          >
            <Image
              className='w-24 h-24 object-contain'
              src={moods}
              alt='Daily Dose Emoticons'
            />
            <h2 className='font-bold text-2xl'>Mood Tracking Made Easy</h2>
            <p>Monitor your mood trends and build awareness over time.</p>
          </motion.div>
          <motion.div className='flex flex-col gap-3 px-6' {...motionProps(3)}>
            <Image
              className='w-24 h-24 object-contain'
              src={ai}
              alt='Daily Dose AI Emoticon'
            />
            <h2 className='font-bold text-2xl'>AI-Powered Journaling</h2>
            <p>
              Get personalized insights and recommendations tailored to you.
            </p>
          </motion.div>
          {user != null ? (
            <motion.p
              className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full w-max md:col-span-3 justify-self-center hover:bg-[#6D533F] transition-colors duration-300 ease-in-out'
              {...motionProps(4)}
            >
              <Link href={'/home'}>Start Tracking</Link>
            </motion.p>
          ) : (
            <motion.p
              className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full w-max md:col-span-3 justify-self-center hover:bg-[#6D533F] transition-colors duration-300 ease-in-out'
              {...motionProps(4)}
            >
              <Link href={'/register'}>Start Tracking</Link>
            </motion.p>
          )}
        </section>
        <section
          id='about'
          className='grid md:grid-cols-3 gap-5 container mx-auto py-12 p-6 items-center'
        >
          <div className='flex flex-col gap-3'>
            <h1 className='text-3xl font-bold'>First Dose</h1>
            <p>
              Imagined at{' '}
              <Link href={'https://www.colorstack.org/'} className='underline'>
                ColorStack
              </Link>
              ’s Winter ‘24 Hackathon ❤️
            </p>
            <p>
              By{' '}
              <Link
                href={'https://www.linkedin.com/in/desolafujah/'}
                className='underline'
              >
                Desola
              </Link>
              ,{' '}
              <Link
                href={'https://www.linkedin.com/in/bernard-ginn-jr/'}
                className='underline'
              >
                Bernard
              </Link>
              ,{' '}
              <Link
                href={'https://www.linkedin.com/in/kelechi-opurum/'}
                className='underline'
              >
                Kelechi
              </Link>
              , &{' '}
              <Link href={'https://janrebolledo.com'} className='underline'>
                Jan
              </Link>
            </p>
            <Link
              href={'mailto:dailydose.bdjk@gmail.com'}
              className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full w-max hover:bg-[#6D533F] transition-colors duration-300 ease-in-out'
            >
              Contact
            </Link>
          </div>
          <Image
            src={aboutImage}
            alt='About Us'
            className='w-full h-80 object-cover rounded-2xl md:col-span-2'
          />
        </section>
      </main>
    </div>
  );
}
