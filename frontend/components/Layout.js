import Image from "next/image"

import logo from '../public/assets/brand/Happy.png'
import Link from "next/link"

export default function Layout({ route, children }) {
  return (
    <main className="max-w-sm mx-auto">
      <header className="fixed top-12 left-0 right-0 flex justify-center items-center max-w-sm mx-auto">
        <Image src={logo} className="w-12 h-12" alt="Daily Dose Happy Emoticon" />
      </header>
      {children}
      <footer className="fixed bottom-12 left-0 right-0 flex justify-center items-center">
        <div className="px-2 pr-5 py-2 bg-yellow-950/5 flex items-center justify-center gap-5 rounded-full font-bold">
          <Link href='/feed' className="px-5 py-3 rounded-full bg-white font-extrabold">Home</Link>
          <Link href='/journal'>Journal</Link>
          <Link href='/mood'>Mood</Link>
        </div>
      </footer>
    </main>
  )
}
