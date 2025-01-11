import Layout from '../../../../components/Layout';
import AI from '../../../../public/assets/brand/AI.png';
import Image from 'next/image';

export default async function Page({ params }) {
  const entry = await getEntry({ entryID: params.id });
  return (
    <Layout route='journal'>
      <section className='flex flex-col gap-2'>
        <article>
          <div className='flex flex-col gap-1 items-center justify-center rounded-lg w-14 bg-white'>
            <p className='text-xs font-semibold bg-yellow-200 w-full rounded-t-lg text-center py-1'>
              {weekday[date.getDay()]}
            </p>
            <p className='text-lg font-bold '>{date.getDate()}</p>
          </div>
          <p>{entry.content}</p>
        </article>
        <div className='flex gap-2 font-semibold text-lg'>
          <Image src={AI} alt='Daily Dose AI Emoticon' className='w-14 h-14' />
          <h2>AI Insights</h2>
        </div>
        <h3 className='text-lg'>Mental Health Tip</h3>
        <p>{entry.mentalHealthTip}</p>
        <h3 className='text-lg'>Productivity Hack</h3>
        <p>{entry.hack}</p>
        <h3 className='text-lg'>Quote</h3>
        <p>{entry.quote}</p>
      </section>
    </Layout>
  );
}
