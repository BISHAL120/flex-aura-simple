
import { redirect } from "next/navigation";
import { getServerSession } from "./get-session";

export async function isAdmin() {
  const session = await getServerSession();
  const user = session?.user;
  if (!user?.role?.includes("ADMIN")) {
    redirect("/")
  }
  return user;
}

