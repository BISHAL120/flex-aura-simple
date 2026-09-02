import { UnauthenticatedPage } from "@/components/auth/unauthenticated/unauthenticated-page"

export const metadata = {
  title: "Sign In Required | Flex Aura Metal Art",
  description: "Sign in to your Flex Aura account to access this page.",
}

export default function UnauthenticatedRoute() {
  return <UnauthenticatedPage />
}
