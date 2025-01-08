import Image from "next/image"

import logo from '../public/assets/brand/Happy.png'
import Link from "next/link"

/**
 * Layout
 * @param {('home' | 'journal' | 'mood')} route 
 * @param {boolean} [fullWidth]
 */
export default function Layout({ route, fullWidth, children }) {
  const selectedStyles = route === 'home' ? "left-1 w-[75px]" : route === 'mood' ? 'right-1 w-[75px]' : route === 'journal' ? 'left-1/2 right-1/2 -translate-x-1/2 w-20' : ''

  return (
    <main className={`${fullWidth ? 'w-full' : 'max-w-sm'} mx-auto`}>
      <header className="fixed z-50 top-12 left-0 right-0 flex justify-center items-center max-w-sm mx-auto">
        <Image src={logo} className="w-12 h-12" alt="Daily Dose Happy Emoticon" />
      </header>
      {children}
      <footer className="fixed bottom-12 left-0 right-0 flex justify-center items-center">
        <div className="px-5 py-4 bg-yellow-950/5 flex items-center justify-center gap-7 rounded-full font-bold relative">
          <Link href='/home' className="z-10">Home</Link>
          <Link href='/journal' className="z-10">Journal</Link>
          <Link href='/mood' className="z-10">Mood</Link>
          <div className={`absolute top-1/2 ${selectedStyles} bottom-1/2 -translate-y-1/2 h-12 rounded-full bg-white transition-all`} />
        </div>
      </footer>
    </main>
  )
}
