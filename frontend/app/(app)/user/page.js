'use client';
import { MaterialSymbolsLogoutRounded } from "../../../components/Icons";
import Layout from "../../../components/Layout";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/authContext/authIndex";
import { useRouter } from 'next/navigation';

import happy from '../../../public/assets/brand/Happy.png'

export default function Page() {
  const { setUser, user } = useAuth();
  const router = useRouter();

  function signOut() {
    setUser(null);
    router.push('/');
  }

  console.log(user)
  return (
    <ProtectedRoute>
      <Layout>
        <section className="flex flex-col gap-5 py-40">
          <div className="flex flex-col gap-5 items-center">
            <Image src={user?.picture ? user.picture : happy} alt="User Profile Picture" width={128} height={128} className="rounded-full w-28 h-28" />
            <h1 className="font-bold text-lg">{user?.name}</h1>
            <div className="flex flex-wrap gap-2">
              <p className="px-5 py-3 bg-neutral-50 rounded-full">Beta Tester</p>
              <p className="px-5 py-3 bg-neutral-50 rounded-full">Beta Tester</p>
              <p className="px-5 py-3 bg-neutral-50 rounded-full">Student</p>
            </div>

            <div className='grid gap-5 grid-cols-2'>
              <div className="p-8 bg-neutral-50 rounded-2xl flex flex-col gap-2">
                <p className="font-bold text-5xl">00</p>
                <p>Journal Entries</p>
              </div>
              <div className="p-8 bg-neutral-50 rounded-2xl flex flex-col gap-2">
                <p className="font-bold text-5xl">00</p>
                <p>Mood Entries</p>
              </div>
            </div>
          </div>
          <button className="bg-yellow-950 mx-3 text-white px-6 py-4 font-bold rounded-full flex items-center justify-center gap-2" onClick={signOut}><MaterialSymbolsLogoutRounded /> Sign Out</button>
          <a className="text-neutral-400 mx-6 my-4 font-bold rounded-full text-center" href={`mailto:dailydose.bdjk@gmail.com?subject=Request%20Data%20Deletion&body=Hello,%0A%0AI would like to request the deletion of my account and associated data.%0A%0AUser ID: ${user.uid}%0A%0AThank you,%0A${user.name}`}>Request Data Deletion</a>
        </section>
      </Layout>
    </ProtectedRoute>
  )
}
