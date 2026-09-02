import { SignupForm } from "@/components/auth/signUp/signUp"

export const metadata = {
  title: "Create Account | Flex Aura Metal Art",
  description: "Join Flex Aura to purchase precision laser-cut metal art, commission bespoke designs, and save your preferences.",
}

export default async function SignUpPage() {

  return <SignupForm />
}
