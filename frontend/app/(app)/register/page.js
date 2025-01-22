'use client';

import { Box, Typography, Button, Container, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import happyface from '/public/assets/brand/Happy.png';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../contexts/authContext/authIndex';
import { apiClient } from '../../lib/api';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { setUser, login } = useAuth();

  // handles the google sign in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await apiClient.signInWithGoogle();
      // The redirect will happen automatically
    } catch (error) {
      setError('Error signing up with Google');
      console.error('Error signing up with Google: ', error);
      setLoading(false);
    }
  };

  // handles manual sign-up with email, password, and username
  const handleSignUp = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.request('/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          displayName: username,
        }),
      });

      if (response.token) {
        login(response.user, response.token);
        router.push('/home');
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      if (error.message.includes('email-already-in-use')) {
        setError('Email is already in use. Please log in instead.');
      } else if (error.message.includes('weak-password')) {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Error signing up');
      }
      console.error('Error signing up:', error);
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
      {/* Navbar (Home/Features/About/SignIn) */}
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
        <div className='flex items-center gap-8 font-bold '>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link href={'/'}>Home</Link>
          </motion.p>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link href={'/#features'}>Features</Link>
          </motion.p>
          <motion.p className='hidden md:block hover:text-white transition-colors duration-300 ease-in-out'>
            <Link href={'/#about'}>About</Link>
          </motion.p>
          <motion.p>
            <Link
              href={'/login'}
              className='bg-white text-yellow-950 px-6 py-4 font-bold rounded-full hover:bg-yellow-950 hover:text-white transition-colors duration-300 ease-in-out'
            >
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
          Create an account
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

        {/* Username Input */}
        <TextField
          label='Username'
          variant='outlined'
          fullWidth
          sx={{ mb: 2 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          onClick={handleSignUp}
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
          {loading ? 'Signing up...' : 'Sign Up with Email'}
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
          Sign Up with Google
          <img
            src='/google-logo.png'
            alt='Google Logo'
            width='40'
            height='40'
            style={{ marginLeft: '0px' }}
          />
        </Button>

        {error && (
          <Typography variant='body2' sx={{ mt: 2, color: '#FF4F4F' }}>
            {error}
          </Typography>
        )}

        <Typography variant='body2' sx={{ mt: 3, color: '#555' }}>
          Already have an account?{' '}
          <Link
            href='/login'
            style={{ textDecoration: 'underline', color: '#422006' }}
          >
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
