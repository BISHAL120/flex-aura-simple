import { SignInForm } from "@/components/auth/login/login"

export const metadata = {
  title: "Sign In | Flex Aura Metal Art",
  description: "Sign in to your Flex Aura account to view orders, track shipping, and manage custom metal art inquiries.",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const joinAs = params.joinas || null

  return <SignInForm joinAs={joinAs} />
}
