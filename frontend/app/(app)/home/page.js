import Link from 'next/link'
import Image from 'next/image'
import Layout from '../../../components/Layout'

import canon from '../../../public/assets/media/canon.jpg'

export default function Page() {
  const quote = 'Be the change you want to see.'
  return (
    <Layout>
      <section className='p-6 grid gap-3'>
        <h1 className='text-white font-extrabold col-end-1 row-end-1 z-10 flex p-12 items-end text-3xl'>&quot;{quote}&quot;</h1>
        <Image src={canon} className='h-96 rounded-2xl col-end-1 row-end-1' alt='Daily Quote Image' />
        <p className='text-center cursor-pointer'>Share Daily Quote</p>
      </section>
      <section>
        <Link href={'/journal'}>journal!</Link>
      </section>
    </Layout>
  )
}
