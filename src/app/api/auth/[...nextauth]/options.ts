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
      async authorize(credentials: any) {
  await dbConnect();

  try {

    console.log('Credentials:', credentials);

    const user = await UserModel.findOne({
      $or: [
        { email: credentials.identifier },
        { username: credentials.identifier },
      ],
    });

    console.log('Found user:', user);

    if (!user) {
      throw new Error('No user found');
    }

    console.log('isVerified:', user.isVerified);

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

    console.log(
      'Password correct:',
      isPasswordCorrect
    );

    if (!isPasswordCorrect) {
      throw new Error('Incorrect password');
    }

    return user;

  } catch (err: any) {

    console.log(err);

    throw new Error(
      err.message || 'Authentication failed'
    );
  }
},
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
  },
};