'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import OptimizedImage from './OptimizedImage';
import heroImage from '../public/assets/media/snow.jpg';
import sunnyImage from '../public/assets/media/betterdays.png';
import restlessNights from '../public/assets/media/restlessnights.png';
import uncertainTimes from '../public/assets/media/uncertaintimes.png';
import happy from '../public/assets/brand/Happy.png';
import sad from '../public/assets/brand/Sad.png';
import upset from '../public/assets/brand/Upset.png';
import uncertain from '../public/assets/brand/Uncertain.png';

export default function ImageRotator({ setCurrentText, setCurrentEmoticon }) {
  const [currentImage, setCurrentImage] = useState(heroImage);
  const [fade, setFade] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload all images to ensure they're available when needed
  useEffect(() => {
    // Preload all images
    const imagesToPreload = [heroImage, sunnyImage, restlessNights, uncertainTimes];
    Promise.all(
      imagesToPreload.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src.src || src; // Handle both imported images and string paths
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    )
      .then(() => setIsLoaded(true))
      .catch((error) => console.error('Error preloading images:', error));
  }, []);

  useEffect(() => {
    if (!isLoaded) return; // Don't start rotation until images are loaded
    
    const images = [heroImage, sunnyImage, restlessNights, uncertainTimes];
    let index = 0;

    const textElement = document.getElementById('hero-text')
    if (textElement) {
      textElement.style.animationPlayState = 'running';
    }

    const interval = setInterval(() => {
      setFade(true);

      setTimeout(() => {
        index = (index + 1) % images.length;
        setCurrentImage(images[index]);

        if (images[index] === heroImage) {
          setCurrentText("Gloomy Days");
          setCurrentEmoticon(sad);
        } else if (images[index] === sunnyImage) {
          setCurrentText("Better Days");
          setCurrentEmoticon(happy);
        } else if (images[index] === restlessNights) {
          setCurrentText("Restless Nights");
          setCurrentEmoticon(upset);
        } else {
          setCurrentText("Uncertain Times");
          setCurrentEmoticon(uncertain);
        }
        setFade(false);
      }, 1000); //the fade duration (1sec)

    }, 4000); //the duration for each image (4sec)
    return () => clearInterval(interval);
  }, [isLoaded, setCurrentText, setCurrentEmoticon]);

  return (
    <OptimizedImage
      src={currentImage}
      alt='Mood Image'
      width={1200}
      height={600}
      priority={true}
      className={`col-end-1 row-end-1 object-cover w-full rounded-2xl h-[600px] transition-opacity duration-1000 ease-in-out ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    />
  );
}
