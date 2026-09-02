import { SignInForm } from "@/components/auth/login/login"

export const metadata = {
  title: "Sign In | Flex Aura Metal Art",
  description: "Sign in to your Flex Aura account to view orders, track shipping, and manage custom metal art inquiries.",
}

export default async function SignInRoute() {
  return <SignInForm />
}
