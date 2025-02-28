import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    isVerified?: boolean;
    isAcceptingMessage?: boolean;
    username?: string;
  }

  interface Session {
    user: {
      id: string;
      isVerified?: boolean;
      isAcceptingMessage?: boolean;
      username?: string;
    } & DefaultSession['user'];
  }

  interface JWT {
    id: string;
    isVerified?: boolean;
    isAcceptingMessage?: boolean;
    username?: string;
  }
}
