'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/authContext/authIndex';

import logo from '../../public/assets/brand/Happy.png'
import Image from 'next/image';

export default function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !user) {
      console.log('Protected route: redirecting to login');
      router.replace('/login');
    }
  }, [user, loading, initialized, router]);

  if (loading || !initialized) {
    return (
      <main
        className='max-w-sm mx-auto max-h-lvh overflow-hidden'
      >
        <header
          className='fixed z-50 top-12 left-0 right-0 flex justify-center items-center max-w-sm mx-auto'
        >
          <Image
            src={logo}
            className='w-14 h-14 grayscale animate-pulse'
            alt='Daily Dose Happy Emoticon'
          />
        </header>

        <section className='flex gap-6 flex-col'>
          <div className='m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-2 w-full h-96 animate-pulse' />
          <div className='m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-2 w-full h-48 animate-pulse delay-75' />
          <div className='m-6 p-8 bg-neutral-100/50 rounded-2xl flex flex-col gap-2 w-full h-48 animate-pulse delay-100' />
        </section>

        <div
          className='fixed z-50 top-12 lg:bottom-12 right-12 drop-shadow-xl rounded-full backdrop-blur-xl'
        >
          <div className='w-6 h-6 text-yellow-950' />
        </div>
        <footer
          className='fixed z-50 bottom-12 w-[235.84px] left-0 right-0 mx-auto rounded-full flex justify-center items-center drop-shadow-xl backdrop-blur-xl'
        >
          <div className='px-5 py-4 bg-yellow-950/5 text-transparent flex items-center justify-center gap-7 rounded-full font-bold relative animate-pulse'>
            <p href='/home' className='z-10'>
              Home
            </p>
            <p href='/journal' className='z-10'>
              Journal
            </p>
            <p href='/mood' className='z-10'>
              Mood
            </p>
          </div>
        </footer>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return children;
} 
