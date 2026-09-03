import db from "@/lib/prisma";
import { User } from "@prisma/client";
import { Prisma } from "@prisma/client";


export const getAllUsers = async (
    page: number = 1,
    per_page: number = 10,
    search: string = "",
    role: string = "",
) => {
    try {
        const skip = (page - 1) * per_page;
        const limit = per_page;

        // Build where clause dynamically
        const where: Prisma.UserWhereInput = {};

        // Add text search for name, email, phone, and location
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phoneNumber: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
            ];
        }

        // Role is a Role[] enum array on Mongo, filter with `has`
        if (role) {
            where.role = { has: role as User["role"][number] };
        }

        // Count total users matching criteria
        const totalUsers = await db.user.count({ where });

        // Counts for the summary strip (unfiltered)
        const [activeCount, bannedCount] = await Promise.all([
            db.user.count({ where: { isBanned: false } }),
            db.user.count({ where: { isBanned: true } }),
        ]);

        // Fetch users with pagination
        const users = await db.user.findMany({
            where,
            take: limit,
            skip,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                sessions: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
                accounts: true,
            },
        });

        return {
            users,
            counts: {
                total: totalUsers,
                active: activeCount,
                banned: bannedCount,
            },
            pagination: {
                page,
                limit,
                total: totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                hasNextPage: (page * limit) < totalUsers,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
    }
};

export const getUserById = async (userId: string) => {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                sessions: {
                    orderBy: { createdAt: 'desc' },
                },
                accounts: true,
            },
        });

        return user;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw new Error("Failed to fetch user");
    }
};

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: { email },
            include: {
                sessions: {
                    orderBy: { createdAt: 'desc' },
                },
                accounts: true,
            },
        });

        return user;
    } catch (error) {
        console.error(`Error fetching user by email ${email}:`, error);
        throw new Error("Failed to fetch user by email");
    }
};

export const updateUser = async ( data: User) => {
    try {
        // Exclude id field from update
        const { id, ...rest } = data;

        const updatedUser = await db.user.update({
            where: { id },
            data: rest,
        });

        return updatedUser;
    } catch (error) {
        console.error(`Error updating user ${data.id}:`, error);
        throw new Error("Failed to update user");
    }
};

// export const deleteUser = async (userId: string) => {
//     try {
//         const deletedUser = await db.user.delete({
//             where: { id: userId },
//         });

//         return deletedUser;
//     } catch (error) {
//         console.error(`Error deleting user ${userId}:`, error);
//         throw new Error("Failed to delete user");
//     }
// };

// export const toggleUserActiveStatus = async (userId: string) => {
//     try {
//         // Fetch the current status
//         const user = await db.user.findUnique({
//             where: { id: userId },
//             select: { isBanned: true },
//         });

//         if (!user) {
//             throw new Error("User not found");
//         }

//         // Toggle the status
//         const updatedUser = await db.user.update({
//             where: { id: userId },
//             data: { isBanned: !user.isBanned },
//             include: {
//                 sessions: true,
//             },
//         });

//         return updatedUser;
//     } catch (error) {
//         console.error(`Error toggling user ${userId} status:`, error);
//         throw new Error("Failed to toggle user status");
//     }
// };