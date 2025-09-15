import NextAuth from "next-auth";
import type { Session } from "next-auth";
import type { Adapter } from "next-auth/adapters";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import dbConnect from "@/lib/db-connect";
import User from "@/models/user";
import { compare } from "bcryptjs";

const adapter = MongoDBAdapter(clientPromise) as Adapter;

interface ExtendedSession {
  user: {
    id: string;
    role: string;
  } & Session["user"];
}

interface ExtendedToken {
  id: string;
  email: string;
  role: string;
}

export const authOptions = {
  adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user || !user.password) return null;

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("Credentials authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      try {
        if (account?.provider === "google") {
          await dbConnect();
          const email = user.email!;
          const googleUid = account.providerAccountId;

          // First try to find by Google UID, then by email
          let dbUser = await User.findOne({
            $or: [{ providerId: googleUid, provider: "google" }, { email }],
          });

          if (!dbUser) {
            // Create new user for Google OAuth
            const userData = {
              name: user.name,
              email,
              image: user.image,
              provider: "google",
              providerId: googleUid,
              role: "user", // Default to user role for new users only
            };

            dbUser = await User.findOneAndUpdate(
              { email },
              { $set: userData },
              { upsert: true, new: true }
            );
          } else {
            // Update existing user if needed, but preserve existing role
            let updated = false;

            if (!dbUser.provider) {
              dbUser.provider = "google";
              updated = true;
            }

            if (!dbUser.providerId) {
              dbUser.providerId = googleUid;
              updated = true;
            }

            // Only set default role if user has no role at all (completely new user scenario)
            if (!dbUser.role) {
              dbUser.role = "user";
              updated = true;
            }
            // If user already has a role, preserve it - don't change it

            if (updated) {
              await dbUser.save();
            }
          }

          // Attach user data to token
          (user as any).id = dbUser._id.toString();
          (user as any).role = dbUser.role;

          // Link Google account if not already linked
          if (adapter.linkAccount) {
            try {
              await adapter.linkAccount({
                userId: dbUser._id.toString(),
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              });
            } catch (linkError) {
              // Account might already be linked, continue
              console.log("Account linking skipped:", linkError);
            }
          }
        }

        return true;
      } catch (err) {
        console.error("SignIn error:", err);
        return false;
      }
    },

    async jwt({ token, user }: { token: any; user: any }) { 
      if (user) {
        token.id = (user as any).id;
        token.email = user.email!;
        token.role = (user as any).role ?? "user";
      }

      return token as ExtendedToken;
    },

    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session as ExtendedSession;
    },

    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Simple redirect handling - no tenant logic
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
