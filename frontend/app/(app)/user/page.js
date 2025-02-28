'use client';

// Import necessary components and hooks
import { MaterialSymbolsLogoutRounded } from "../../../components/Icons";
import Layout from "../../../components/Layout";
import Image from "next/image";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/authContext/authIndex";
import { useRouter } from 'next/navigation';

// Import default profile picture
import happy from '../../../public/assets/brand/Happy.png'

// Main user profile page component
export default function Page() {
  // Get user data and setUser function from auth context
  const { setUser, user } = useAuth();
  // Initialize router for navigation
  const router = useRouter();

  // Function to handle user sign out
  function signOut() {
    // Clear user data from context
    setUser(null);
    // Redirect to home page
    router.push('/');
  }

  // Debug log to show current user data
  console.log(user)

  return (
    // Wrap page in ProtectedRoute to ensure authentication
    <ProtectedRoute>
      {/* Use Layout component for consistent page structure */}
      <Layout>
        {/* Main profile section with vertical spacing */}
        <section className="flex flex-col gap-5 py-40">
          {/* Profile information container */}
          <div className="flex flex-col gap-5 items-center">
            {/* Profile picture - uses user's picture if available, otherwise default happy face */}
            <Image src={user?.picture ? user.picture : happy} alt="User Profile Picture" width={128} height={128} className="rounded-full w-28 h-28" />
            {/* Display user's name */}
            <h1 className="font-bold text-lg">{user?.name}</h1>
            {/* User badges/tags section */}
            <div className="flex flex-wrap gap-2">
              <p className="px-5 py-3 bg-neutral-50 rounded-full">Beta Tester</p>
              <p className="px-5 py-3 bg-neutral-50 rounded-full">Beta Tester</p>
              <p className="px-5 py-3 bg-neutral-50 rounded-full">Student</p>
            </div>

            {/* Stats grid showing journal and mood entries */}
            <div className='grid gap-5 grid-cols-2'>
              {/* Journal entries count */}
              <div className="p-8 bg-neutral-50 rounded-2xl flex flex-col gap-2">
                <p className="font-bold text-5xl">00</p>
                <p>Journal Entries</p>
              </div>
              {/* Mood entries count */}
              <div className="p-8 bg-neutral-50 rounded-2xl flex flex-col gap-2">
                <p className="font-bold text-5xl">00</p>
                <p>Mood Entries</p>
              </div>
            </div>
          </div>
          {/* Sign out button with icon */}
          <button className="bg-yellow-950 mx-3 text-white px-6 py-4 font-bold rounded-full flex items-center justify-center gap-2" onClick={signOut}>
            <MaterialSymbolsLogoutRounded /> Sign Out
          </button>
          {/* Data deletion request link that pre-fills email with user information */}
          <a className="text-neutral-400 mx-6 my-4 font-bold rounded-full text-center" 
             href={`mailto:dailydose.bdjk@gmail.com?subject=Request%20Data%20Deletion&body=Hello,%0A%0AI would like to request the deletion of my account and associated data.%0A%0AUser ID: ${user?.uid || 'Not available'}%0A%0AThank you,%0A${user?.name || 'User'}`}>
            Request Data Deletion
          </a>
        </section>
      </Layout>
    </ProtectedRoute>
  )
}
