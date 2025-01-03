import Image from "next/image"
import Link from "next/link"
import canon from '../../../../public/assets/media/canon.jpg'
import logo from '../../../../public/assets/brand/Happy.png'

import getQuote from '../../../lib/quote'

export default async function Page({ params }) {
  const quoteID = (await params).id
  const { quote, userID } = await getQuote({ quoteID: quoteID })

  return (
    <main className="max-w-sm mx-auto">
      <header className="fixed top-12 left-0 right-0 flex justify-center items-center max-w-sm mx-auto">
        <Image src={logo} className="w-12 h-12" alt="Daily Dose Happy Emoticon" />
      </header>
      <section className='p-6 grid gap-3'>
        <div className="text-white col-end-1 row-end-1 z-10 flex p-12 justify-end flex-col">
          <h1 className='font-extrabold text-3xl'>&quot;{quote}&quot;</h1>
          <p className='text-center'>Shared by {userID}</p>
        </div>
        <Image src={canon} className='h-[80lvh] object-cover rounded-2xl col-end-1 row-end-1' alt="Daily Quote Image" />
      </section>
      <footer className="flex justify-center flex-col items-center text-pretty gap-2">
        <p>Improve your mood with Daily Dose</p>
        <Link
          href={'/'}
          className='bg-yellow-950 text-white px-6 py-4 font-bold rounded-full'
        >
          Get Started
        </Link>
      </footer>
    </main>
  )
}
