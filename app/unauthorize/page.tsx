import { UnauthorizePage } from "@/components/auth/unauthorize/unauthorize-page"
import { getServerSession } from "@/lib/get-session"

export const metadata = {
  title: "Access Denied | Flex Aura Metal Art",
  description: "Your Flex Aura account does not have permission to view this page.",
}

export default async function UnauthorizeRoute() {
  const session = await getServerSession()

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
      }
    : null

  return <UnauthorizePage user={user} />
}
