import db from "@/lib/prisma"
import { Prisma, type ContactStatus } from "@prisma/client"

export interface ContactSubmissionListResult {
  submissions: Prisma.ContactSubmissionGetPayload<object>[]
  counts: {
    total: number
    new: number
    read: number
    replied: number
    archived: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export const getAllContactSubmissions = async (
  page: number = 1,
  per_page: number = 8,
  search: string = "",
  status: ContactStatus | "all" = "all",
): Promise<ContactSubmissionListResult> => {
  try {
    const skip = (page - 1) * per_page
    const limit = per_page

    const where: Prisma.ContactSubmissionWhereInput = { isDeleted: false }
    if (status !== "all") where.status = status

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ]
    }

    const total = await db.contactSubmission.count({ where })

    const [newCount, readCount, repliedCount, archivedCount] = await Promise.all([
      db.contactSubmission.count({ where: { isDeleted: false, status: "new" } }),
      db.contactSubmission.count({ where: { isDeleted: false, status: "read" } }),
      db.contactSubmission.count({ where: { isDeleted: false, status: "replied" } }),
      db.contactSubmission.count({ where: { isDeleted: false, status: "archived" } }),
    ])

    const submissions = await db.contactSubmission.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
    })

    return {
      submissions,
      counts: { total, new: newCount, read: readCount, replied: repliedCount, archived: archivedCount },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    }
  } catch (error) {
    console.error("Error fetching contact submissions:", error)
    throw new Error("Failed to fetch contact submissions")
  }
}

export const getContactSubmissionById = async (id: string) => {
  try {
    return await db.contactSubmission.findFirst({
      where: { id, isDeleted: false },
    })
  } catch (error) {
    console.error(`Error fetching contact submission ${id}:`, error)
    throw new Error("Failed to fetch contact submission")
  }
}

export const createContactSubmission = async (data: {
  name: string
  email: string
  subject: string
  message: string
}) => {
  try {
    return await db.contactSubmission.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        subject: data.subject.trim(),
        message: data.message.trim(),
        status: "new",
      },
    })
  } catch (error) {
    console.error("Error creating contact submission:", error)
    throw new Error("Failed to save contact submission")
  }
}

export const updateContactSubmissionStatus = async (
  id: string,
  status: ContactStatus,
) => {
  try {
    return await db.contactSubmission.update({
      where: { id },
      data: { status },
    })
  } catch (error) {
    console.error(`Error updating contact submission ${id}:`, error)
    throw new Error("Failed to update contact submission")
  }
}

export const getContactSubmissionDashboardCounts = async () => {
  try {
    return await db.contactSubmission.count({ where: { isDeleted: false, status: "new" } })
  } catch (error) {
    console.error("Error fetching contact submission dashboard counts:", error)
    throw new Error("Failed to fetch contact submission counts")
  }
}
