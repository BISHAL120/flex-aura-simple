import type { User, Session, Account } from "@prisma/client"
import type { AdminUser, UserRole } from "@/lib/admin-users-data"

export function mapUserToAdminUser(user: User & { sessions: Session[]; accounts: Account[] }): AdminUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage,
    bio: user.bio,
    location: user.location,
    isBanned: user.isBanned,
    role: (user.role ?? []) as UserRole[],
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    sessions: user.sessions.map((session) => ({
      id: session.id,
      expiresAt: session.expiresAt.toISOString(),
      token: session.token,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      userId: session.userId,
    })),
    accounts: user.accounts.map((account) => ({
      id: account.id,
      issuer: account.issuer,
      accountId: account.accountId,
      providerId: account.providerId,
      userId: account.userId,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    })),
  }
}

export function mapUsersToAdminUsers(users: (User & { sessions: Session[]; accounts: Account[] })[]): AdminUser[] {
  return users.map(mapUserToAdminUser)
}
