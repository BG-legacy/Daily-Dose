'use client'
import { useState } from "react";
import Layout from "../../../components/Layout";
import Image from "next/image";

import halo from '../../../public/assets/media/halo.png'

import happy from '../../../public/assets/brand/Happy.png'
import sad from '../../../public/assets/brand/Sad.png'
import upset from '../../../public/assets/brand/Upset.png'

export default function Page() {
  return (
    <Layout route='mood' fullWidth>
      <section className="w-full h-lvh grid grid-cols-1 grid-rows-1">
        <div className="w-full h-full flex flex-col justify-center items-center">
          <form className="flex flex-col gap-8 justify-center items-center">

            <label className="font-bold items-center justify-center text-pretty text-center">
              How was your mood today?
              <input />
            </label>
            <button className="bg-yellow-950 text-white px-6 py-4 font-bold rounded-full">Submit</button>
          </form>
        </div>
      </section>
    </Layout>
  )
}
