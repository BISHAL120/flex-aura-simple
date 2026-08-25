import AboutPage from '@/components/public/about/about'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "About Us — Flex Aura",
  description:
    "Flex Aura laser-cuts 2mm metal wall art of your favourite cars, bikes and custom designs — made to order, in your size.",
}


const Page = () => {
  return <AboutPage />
}

export default Page