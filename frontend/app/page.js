import Image from 'next/image';

import happy from '../public/assets/brand/Happy.png'
import Link from 'next/link';

import sad from '../public/assets/brand/Sad.png'
import fire from '../public/assets/brand/Fire.png'
import moods from '../public/assets/brand/Moods.png'
import ai from '../public/assets/brand/AI.png'

import heroImage from '../public/assets/media/snow.jpg'
import aboutImage from '../public/assets/media/canon.jpg'

export default function Home() {
  return (
    <div className='tracking-tight'>
      <header className='justify-between flex fixed container mx-auto left-0 right-0 items-center top-16 text-yellow-950 px-12 md:p-0'>
        <Link href={'/'} className='flex gap-2 items-center leading-snug font-extrabold'>
          <Image src={happy} alt='Daily Dose Logo' width='42' height='42' />
          <span>Daily<br />Dose</span>
        </Link>
        <div className='hidden md:flex items-center gap-8 font-bold'>
          <Link href={'/'}>
            Home
          </Link>
          <Link href={'/'}>
            Features
          </Link>
          <Link href={'/'}>
            About
          </Link>
          <Link href={'/'}>
            Contact
          </Link>
        </div>
      </header>
      <main>
        <section className='grid w-full px-6 mt-6'>
          <div className='absolute left-0 right-0 top-0 bottom-0 overflow-x-hidden'>
            <Image src={happy} alt='Daily Dose Happy Emoticon' className='absolute -left-12 md:-left-20 top-48 md:top-60 w-36 h-36 md:w-52 md:h-52 rotate-[30deg]' />
            <Image src={sad} alt='Daily Dose Sad Emoticon' className='absolute -right-12 md:-right-48 top-72 w-32 h-32 md:w-96 md:h-96 -rotate-12' />
          </div>
          <div className='col-end-1 row-end-1 z-10 w-full flex flex-col justify-end items-center gap-3 text-yellow-950 py-12'>
            <h1 className='flex flex-col items-center gap-1'>
              <span>A <b>Daily Dose</b> of <b>Wellness</b> for</span>
              <span className='flex items-center gap-2 font-bold text-3xl'>Gloomy Days <Image alt='Daily Dose Sad Emoticon' src={sad} width={48} height={48} /></span>
            </h1>
            <Link href={'/register'} className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'>Get Started</Link>
          </div>
          <Image src={heroImage} alt='' className='col-end-1 row-end-1 object-cover w-full rounded-2xl h-[600px]' />
        </section>
        <section className='py-12 px-6 container mx-auto md:grid-cols-3 grid gap-6'>
          <div className='flex flex-col gap-3 px-6'>
            <Image className='w-24 h-24 object-contain' src={fire} alt='Daily Dose Fire Emoticon' />
            <h2 className='font-bold text-2xl'>Inspiration at Your Fingertips</h2>
            <p>Receive daily curated quotes, tips, and hacks to uplift your day.</p>
          </div>
          <div className='flex flex-col gap-3 border-x-neutral-950/10 border-y md:border-y-0 md:border-x py-6 md:py-0 px-6'>
            <Image className='w-24 h-24 object-contain' src={moods} alt='Daily Dose Emoticons' />
            <h2 className='font-bold text-2xl'>Mood Tracking Made Easy</h2>
            <p>Monitor your mood trends and build awareness over time.</p>
          </div>
          <div className='flex flex-col gap-3 px-6'>
            <Image className='w-24 h-24 object-contain' src={ai} alt='Daily Dose AI Emoticon' />
            <h2 className='font-bold text-2xl'>AI-Powered Journaling</h2>
            <p>Get personalized insights and recommendations tailored to you.</p>
          </div>
          <Link href={'/register'} className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full w-max md:col-span-3 justify-self-center'>Start Tracking</Link>
        </section>
        <section className='grid md:grid-cols-3 gap-5 container mx-auto py-12 p-6 items-center'>
          <div className='flex flex-col gap-3'>
            <h1 className='text-3xl font-bold'>First Dose</h1>
            <p>Imagined at <Link href={'https://www.colorstack.org/'} className='underline'>ColorStack</Link>’s Winter
              ‘24 Hackathon ❤️
            </p>
            <p>By Desola, <Link href={'https://www.linkedin.com/in/bernard-ginn-jr/'} className='underline'>Bernard</Link>,{' '}
              <Link href={'https://www.linkedin.com/in/kelechi-opurum/'} className='underline'>Kelechi</Link>, & <Link href={'https://janrebolledo.com'} className='underline'>Jan</Link></p>
            <Link href={'/contact'} className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full w-max'>Contact</Link>
          </div>
          <Image src={aboutImage} alt='About Us' className='w-full h-80 object-cover rounded-2xl md:col-span-2' />
        </section>
      </main>
    </div>
  );
}
