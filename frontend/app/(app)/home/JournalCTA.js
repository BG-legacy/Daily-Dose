'use client'
import { motion } from "framer-motion"
import { motionProps } from "../../utils/motion"
import Link from "next/link"

export default function JournalCTA() {
  return (
    <motion.section {...motionProps(1)} className="m-6 p-8 bg-neutral-100/50 rounded-2xl">
      <Link href={'/journal'}>journal!</Link>
    </motion.section>
  )
}
