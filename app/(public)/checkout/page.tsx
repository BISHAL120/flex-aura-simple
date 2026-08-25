import CheckoutPage from '@/components/public/checkout/checkout-page'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Checkout — Flex Aura",
  description: "Complete your metal art purchase at Flex Aura.",
}

const Page = () => {

  return (
    <div>
      <CheckoutPage />
    </div>
  )
}

export default Page