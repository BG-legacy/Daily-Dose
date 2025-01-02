'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import heroImage from '../public/assets/media/snow.jpg';
import sunnyImage from '../public/assets/media/betterdays.png';
import happy from '../public/assets/brand/Happy.png';
import sad from '../public/assets/brand/Sad.png';

export default function ImageRotator({ setCurrentText, setCurrentEmoticon }) {
  const [currentImage, setCurrentImage] = useState(heroImage);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const images = [heroImage, sunnyImage];
    let index = 0;

    const interval = setInterval(() => {
      setFade(true); 

      setTimeout(() => {
        index = (index + 1) % images.length;
        setCurrentImage(images[index]);

        
        if (images[index] === heroImage) {
          setCurrentText("Gloomy Days");
          setCurrentEmoticon(sad);
        } else {
          setCurrentText("Better Days");
          setCurrentEmoticon(happy);
        }
        setFade(false);
      }, 1000); //the fade duration (1sec)

    }, 7000); //the duration for each image (7sec)
    return () => clearInterval(interval); 
  }, [setCurrentText, setCurrentEmoticon]);

  return (
    <Image
      src={currentImage}
      alt='Mood Image'
      className={`col-end-1 row-end-1 object-cover w-full rounded-2xl h-[600px] transition-opacity duration-1000 ease-in-out ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    />
  );
}
