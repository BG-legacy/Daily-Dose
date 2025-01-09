'use client'
import { motion } from 'motion/react'
import { motionProps } from '../../../app/utils/motion.js'

import Image from "next/image"

import canon from '../../../public/assets/media/canon.jpg'

const url = 'https://localhost:3001'

export default function QuoteCard({ quote }) {
  let shareData = { title: 'Quote from Daily Dose', url: `${url}/quote/${quote.quoteID}` }

  return (
    <section className='p-6 grid gap-3'>
      <motion.h1 className='text-white font-extrabold col-end-1 row-end-1 z-10 flex p-12 items-end text-3xl' {...motionProps(1)}>&quot;{quote.quote}&quot;</motion.h1>
      <motion.div {...motionProps(0)} className='col-end-1 row-end-1'>
        <Image src={canon} className='h-96 rounded-2xl' alt='Daily Quote Image' />
      </motion.div>
      <motion.p className='text-center cursor-pointer col-end-1' {...motionProps(2)} onClick={() => navigator.share(shareData)}>Share Daily Quote</motion.p>
    </section>
  )
}
