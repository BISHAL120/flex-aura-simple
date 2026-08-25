import CustomOrderPage from '@/components/public/custom-order/custom-order'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Custom Order Request — Flex Aura",
  description:
    "Request a custom laser-cut metal art piece — your car, bike, logo, name or design, made to your size with or without backlit LED light.",
}

const Page = () => {
  return (
    <div>
      <CustomOrderPage />
    </div>
  )
}

export default Page