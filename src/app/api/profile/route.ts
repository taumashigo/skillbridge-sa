import { apiOk, apiErr, parseBody, auditLog } from "@/lib/utils/api";
import { ProfileSchema } from "@/lib/validators/schemas";
import prisma from "@/lib/db/prisma";

// TODO: Replace with real auth — get userId from session
const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();
  const parsed = await parseBody(request, ProfileSchema);
  if ("error" in parsed) return parsed.error;

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...parsed.data },
    update: parsed.data,
  });

  await auditLog(prisma, { userId, action: "PROFILE_UPDATE", resourceType: "profile", resourceId: profile.id });
  return apiOk(profile, 201);
}

export async function GET() {
  const userId = getUserId();
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return apiErr("NOT_FOUND", "Profile not found", [], 404);
  return apiOk(profile);
}
