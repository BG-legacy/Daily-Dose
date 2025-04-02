'use client';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { motionProps } from '../app/utils/motion';
import logo from '../public/assets/brand/Happy.png';
import Link from 'next/link';

import { MaterialSymbolsPersonRounded } from '../components/Icons';


/**
 * Layout
 * @param {('home' | 'journal' | 'mood')} route
 * @param {boolean} [fullWidth]
 */
export default function Layout({
  route,
  fullWidth,
  children,
  onClick,
  className,
}) {
  const [highlightedRoute, setHighlightedRoute] = useState(route)
  const highlightStyles = {
    'home'
      : 'left-1 w-[75px]',
    'mood':
      'left-[155px] w-[75px]',
    'journal':
      'left-1/2 right-1/2 -translate-x-1/2 w-20'
  }

  function resetHighlightedRoute() {
    setHighlightedRoute(route)
  }

  return (
    <main
      className={`${fullWidth ? 'w-full' : 'max-w-sm'} mx-auto ${className}`}
      onClick={onClick}
      onDragStart={onClick}
      onTouchStart={onClick}
    >
      <motion.header
        {...motionProps(0)}
        className='fixed z-50 top-12 left-0 right-0 flex justify-center items-center max-w-sm mx-auto'
      >
        <Link href='/home'>
          <Image
            src={logo}
            className='w-14 h-14'
            alt='Daily Dose Happy Emoticon'
          />
        </Link>
      </motion.header>
      {children}
      <motion.div
        className='fixed z-50 top-12 lg:bottom-12 right-12 drop-shadow-xl rounded-full backdrop-blur-xl'
        {...motionProps(1)}
      >
        <Link href='/user' className='p-4 flex rounded-full bg-yellow-950/5'>
          <MaterialSymbolsPersonRounded className='w-6 h-6 text-yellow-950' />
        </Link>
      </motion.div>
      <motion.footer
        {...motionProps(0)}
        className='fixed z-50 bottom-12 w-[235.84px] left-0 right-0 mx-auto rounded-full flex justify-center items-center drop-shadow-xl backdrop-blur-xl'
      >
        <div className='px-5 py-4 bg-yellow-950/5 flex items-center justify-center gap-7 rounded-full font-bold relative'>
          <Link href='/home' className='z-10' onMouseOver={() => setHighlightedRoute('home')} onMouseOut={resetHighlightedRoute}>
            Home
          </Link>
          <Link href='/journal' className='z-10' onMouseOver={() => setHighlightedRoute('journal')} onMouseOut={resetHighlightedRoute}>
            Journal
          </Link>
          <Link href='/mood' className='z-10' onMouseOver={() => setHighlightedRoute('mood')} onMouseOut={resetHighlightedRoute}>
            Mood
          </Link>
          <div
            className={`absolute top-1/2 ${highlightStyles[highlightedRoute]} bottom-1/2 -translate-y-1/2 h-12 rounded-full bg-white/95 transition-all delay-[50ms] ease-in-out duration-300 pointer-events-none`}
          />
        </div>
      </motion.footer>
    </main>
  );
}
