import NextAuth, { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: "SkillBridge SA <onboarding@resend.dev>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          await resend.emails.send({
            from: "SkillBridge SA <onboarding@resend.dev>",
            to: email,
            subject: "Sign in to SkillBridge SA",
            html: `
              <div style="font-family:'Helvetica',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0B1121;color:#F1F5F9;border-radius:16px;">
                <div style="text-align:center;margin-bottom:24px;">
                  <div style="display:inline-block;width:40px;height:40px;background:linear-gradient(135deg,#22D3A7,#38BDF8);border-radius:10px;line-height:40px;font-size:20px;font-weight:800;color:#0B1121;">S</div>
                </div>
                <h1 style="font-size:22px;font-weight:700;text-align:center;margin-bottom:8px;">Sign in to SkillBridge SA</h1>
                <p style="color:#94A3B8;text-align:center;font-size:14px;margin-bottom:28px;">Click the button below to securely sign in. This link expires in 24 hours.</p>
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="${url}" style="display:inline-block;background:#22D3A7;color:#0B1121;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;">Sign In</a>
                </div>
                <p style="color:#64748B;font-size:12px;text-align:center;">If you did not request this email, you can safely ignore it.</p>
              </div>
            `,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?verify=true",
    error: "/login?error=true",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};