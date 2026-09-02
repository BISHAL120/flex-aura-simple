import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import db from './prisma';
// import { Resend } from 'resend';
// import { forgotPasswordTemplate } from './templetes/password-reset-email';
// import { verifyEmailTemplate } from './templetes/verify-email';

// const resend = new Resend(process.env.RESEND_API_KEY as string);



export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: 'mongodb',
  }),
//   emailVerification: {
//     sendVerificationEmail: async ({ user, url }) => {
//       resend.emails.send({
//         from: 'GlobalSoft Hub <info@globalsofthub.com>',
//         to: user.email,
//         subject: 'Verify Your Email',
//         html: verifyEmailTemplate(user.name, url),
//       });
//     },
//     sendOnSignUp: true,
//   },
  emailAndPassword: {
    enabled: true,
    maxPasswordLength: 50,
    // requireEmailVerification: true,
    // sendResetPassword: async ({ user, url }) => {
    //   // Send email using Resend
    //   const { error } = await resend.emails.send({
    //     from: 'GlobalSoft Hub <info@globalsofthub.com>',
    //     to: user.email,
    //     subject: 'Reset Password',
    //     html: forgotPasswordTemplate(url),
    //   });
    //   if (error) {
    //     console.error('Error sending email:', error);
    //     throw new Error('Failed to send reset password email');
    //   }
    // },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          let [firstName, lastName] = user.name.split('/');
          if (!firstName || !lastName) {
            [firstName, lastName] = user.name.split(' ');
          }
          if (lastName === undefined) {
            lastName = '';
          }
          return {
            data: {
              ...user,
              role: ['USER'],
              firstName,
              lastName,
            },
          };
        },
      },
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
        input: true,
      },
      lastName: {
        type: 'string',
        input: true,
      },
      role: {
        type: 'string[]',
        input: false
      },
      isActive: {
        type: 'boolean',
        input: false,
      },

    }
  },
  rateLimit: {
    enabled: true,
    window: 60, // time window in seconds
    max: 5, // max requests in the window
  },
})