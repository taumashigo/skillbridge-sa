import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

// Protect all (app) routes — dashboard, assessment, learning, etc.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assessment/:path*",
    "/learning/:path*",
    "/podcast/:path*",
    "/cv-optimiser/:path*",
    "/portfolio/:path*",
    "/interview/:path*",
    "/settings/:path*",
  ],
};
