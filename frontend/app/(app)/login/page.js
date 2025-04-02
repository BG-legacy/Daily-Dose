'use client';

import { Box, Typography, Button, Container, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import happyface from '/public/assets/brand/Happy.png';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../contexts/authContext/authIndex';
import { apiClient } from '../../lib/api';

export default function SignInPage() {
  // Initialize Next.js router for navigation
  const router = useRouter();
  
  // State management for form fields and UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Get authentication context methods
  const { user, setUser, login } = useAuth();

  // Handle Google OAuth Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Redirect to Google OAuth flow
      await apiClient.signInWithGoogle();
      // The redirect will happen automatically via the API client
    } catch (error) {
      setError('Error signing in with Google');
      console.error('Error signing in with Google: ', error);
      setLoading(false);
    }
  };

  // Handle traditional email/password login
  const handleEmailPasswordLogin = async () => {
    setLoading(true);
    try {
      // Send login request to backend
      const response = await apiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        })
      });

      // If authentication successful, update context and redirect
      if (response.authenticated) {
        await login(response.user, response.token);
        router.push('/home');
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Error signing in with email and password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth='false'
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
      {/* Navbar (Home/Features/About/SignUp) */}
      <header className='justify-between flex fixed container mx-auto left-0 right-0 items-center top-16 text-yellow-950 px-12 md:p-0 z-30'>
        <motion.p>
          <Link
            href={'/'}
            className='flex gap-2 items-center leading-none font-extrabold'
          >
            <Image
              src={happyface}
              alt='Daily Dose Logo'
              width='42'
              height='42'
            />
            <span>
              Daily
              <br />
              Dose
            </span>
          </Link>
        </motion.p>
        <div className='flex items-center gap-8 font-bold'>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link href={'/'}>Home</Link>
          </motion.p>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link href={'/#features'}>Features</Link>
          </motion.p>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link href={'/#about'}>About</Link>
          </motion.p>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link
              href={'/register'}
              className='bg-white text-yellow-950 px-6 py-4 font-bold rounded-full hover:bg-yellow-950 hover:text-white transition-colors duration-300 ease-in-out'
            >
              Sign Up
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
          bgcolor: 'rgba(255, 255, 255, 0.8)', // semi-transparent white background
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          textAlign: 'center',
          zIndex: 2,
          animation: 'slideUp 1s ease-out',
        }}
      >
        <Typography
          variant='h4'
          sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}
        >
          Login to DailyDose
        </Typography>
        <Typography variant='body1' sx={{ mb: 4, color: '#555' }}>
          Track moods, journal, and thrive with DailyDose.
        </Typography>

        {/* Email Input */}
        <TextField
          label='Email'
          variant='outlined'
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password Input */}
        <TextField
          label='Password'
          type='password'
          variant='outlined'
          fullWidth
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant='contained'
          onClick={handleEmailPasswordLogin}
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
          {loading ? 'Logging in...' : 'Log in with Email'}
        </Button>

        {/* Google Sign-In Button */}
        <Button
          variant='outlined'
          onClick={handleGoogleSignIn}
          sx={{
            backgroundColor: '#ffffff',
            color: '#422006',
            '&:hover': { backgroundColor: '#6D533F', color: 'white' },
            width: '100%',
            borderRadius: '20px',
            textTransform: 'none',
            fontWeight: 'bold',
            marginTop: '10px',
          }}
        >
          Sign in with Google
          <Image
            src='/google-logo.png'
            alt='Google Logo'
            width='30'
            height='30'
            style={{ marginLeft: '10px' }}
          />
        </Button>
        {error && (
          <Typography variant='body2' sx={{ mt: 2, color: 'red' }}>
            {error}
          </Typography>
        )}

        <Typography variant='body2' sx={{ mt: 3, color: '#555' }}>
          Don&apos;t have an account yet?{' '}
          <Link
            href='/register'
            style={{ textDecoration: 'underline', color: '#422006' }}
          >
            Sign Up
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
