export type UserRole = "ADMIN" | "MANAGER" | "USER"

export type UserSession = {
  id: string
  expiresAt: string
  token: string
  createdAt: string
  updatedAt: string
  ipAddress?: string | null
  userAgent?: string | null
  userId: string
}

export type UserAccount = {
  id: string
  issuer?: string | null
  accountId: string
  providerId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export type AdminUser = {
  id: string
  firstName: string
  lastName?: string | null
  name: string
  email: string
  emailVerified: boolean
  phoneNumber?: string | null
  profileImage?: string | null
  bio?: string | null
  location?: string | null
  isBanned: boolean
  role: UserRole[]
  createdAt: string
  updatedAt: string
  sessions: UserSession[]
  accounts: UserAccount[]
}