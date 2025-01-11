'use client';

import { Box, Typography, Button, Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '../../lib/firebase';
import Image from 'next/image';
import { motion } from 'motion/react';
import happyface from '/public/assets/brand/Happy.png';
import Link from 'next/link';
import { useState } from 'react';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);  

  //hands the google sign in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('User registered:', data);
          router.push('/home');  
        } else { // if they cant register, log the error
          setError('Error registering user');
        }
      }
    } catch (error) {
      setError('Error signing in with Google');
      console.error('Error signing in with Google: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="false"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Navbar (Home/Features/About/SignIn) */}
      <header className='justify-between flex fixed container mx-auto left-0 right-0 items-center top-16 text-yellow-950 px-12 md:p-0 z-30'>
        <motion.p>
          <Link
            href={'/'}
            className='flex gap-2 items-center leading-none font-extrabold'
          >
            <Image src={happyface} alt='Daily Dose Logo' width='42' height='42' />
            <span>
              Daily
              <br />
              Dose
            </span>
          </Link>
        </motion.p>
        <div className='flex items-center gap-8 font-bold '>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link href={'/'}>Home</Link >
          </motion.p>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link href={'/#features'}>Features</Link>
          </motion.p>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link href={'/#about'}>About</Link>
          </motion.p>
          <motion.p>
            <Link href={'/login'} className='bg-white text-yellow-950 px-6 py-4 font-bold rounded-full hover:bg-yellow-950 hover:text-white transition-colors duration-300 ease-in-out'>
              Login
            </Link>
          </motion.p>
        </div>
      </header>

      {/* background img with Blur Effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/sign-in-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(10px)',
          zIndex: -1,
        }}
      ></Box>

      {/* account creation box */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.8)',  // semi-transparent white background
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          textAlign: 'center',
          zIndex: 2,
          animation: 'slideUp 1s ease-out',
        }}
      >
        <Image
          src="/google-logo.png"
          alt="Google Logo"
          width={200}
          height={100}
          style={{ marginBottom: '20px' }}
        />
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
          Create an account
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#555' }}>
          Track moods, journal, and thrive with DailyDose.
        </Typography>
        <Button
          variant="contained"
          onClick={handleGoogleSignIn}
          sx={{
            backgroundColor: '#422006',
            color: 'white',
            '&:hover': { backgroundColor: '#6D533F' },
            width: '100%',
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: loading ? 'pulse 1.5s infinite' : 'none',
          }}
        >
          {loading ? 'Signing up...' : 'Sign Up with Google'}
        </Button>

        {error && (
          <Typography variant="body2" sx={{ mt: 2, color: 'red' }}>
            {error}
          </Typography>
        )}

        <Typography variant="body2" sx={{ mt: 3, color: '#555' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ textDecoration: 'underline', color: '#422006' }}>
            Login
          </Link>
        </Typography>
      </Box>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Container>
  );
}
