import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export const authOptions: NextAuthOptions = {
  providers: [

    CredentialsProvider({

      id: 'credentials',

      name: 'Credentials',

      credentials: {

        identifier: {

          label: 'Email or Username',

          type: 'text',

        },

        password: {

          label: 'Password',

          type: 'password',

        },

      },

      async authorize(
        credentials:
          | Record<'identifier' | 'password', string>
          | undefined
      ) {

        await dbConnect();

        try {

          if (!credentials) {

            throw new Error(
              'Missing credentials'
            );

          }

          const user =
            await UserModel.findOne({

              $or: [

                {
                  email:
                    credentials.identifier,
                },

                {
                  username:
                    credentials.identifier,
                },

              ],

            });

          if (!user) {

            return null;

          }

          if (!user.isVerified) {

            throw new Error(

              'Please verify your account before logging in'

            );

          }

          const isPasswordCorrect =
            await bcrypt.compare(

              credentials.password,

              user.password

            );

          if (!isPasswordCorrect) {

            throw new Error(

              'Incorrect password'

            );

          }

          return {
  id: user._id.toString(),

  _id: user._id.toString(),

  email: user.email,

  username: user.username,

  isVerified: user.isVerified,

  isAcceptingMessages: user.isAcceptingMessages,
};

        } catch (err: unknown) {

  if (err instanceof Error) {

    throw new Error(err.message);

  }

  throw new Error('Authentication failed');

}

      },

    }),

  ],

  callbacks: {

    async jwt({

      token,

      user,

    }) {

      if (user) {

        token._id =
          user._id;

        token.username =
          user.username;

        token.isVerified =
          user.isVerified;

        token.isAcceptingMessages =
          user.isAcceptingMessages;

      }

      return token;

    },

    async session({

      session,

      token,

    }) {

      if (session.user) {

        session.user._id =
          token._id as string;

        session.user.username =
          token.username as string;

        session.user.isVerified =
          token.isVerified as boolean;

        session.user.isAcceptingMessages =
          token.isAcceptingMessages as boolean;

      }

      return session;

    },

  },

  session: {

    strategy: 'jwt',

  },

  secret:

    process.env.NEXTAUTH_SECRET,

  pages: {

    signIn:

      '/sign-in',

  },

};