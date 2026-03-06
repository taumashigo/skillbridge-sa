import { apiOk, apiErr, auditLog } from "@/lib/utils/api";
import { deleteCvFromStorage } from "@/lib/db/supabase";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function DELETE() {
  const userId = getUserId();

  // Delete all stored CV files
  const cvs = await prisma.cv.findMany({ where: { userId } });
  for (const cv of cvs) {
    await deleteCvFromStorage(cv.fileKey).catch(() => {});
  }

  // Audit before deletion (userId will become null via SET NULL)
  await auditLog(prisma, { userId, action: "DATA_DELETE", resourceType: "user", resourceId: userId, metadata: { reason: "user_requested" } });

  // Cascade delete user (all related records deleted via Prisma cascades)
  await prisma.user.delete({ where: { id: userId } });

  return apiOk({ message: "All data has been permanently deleted.", deletedAt: new Date().toISOString() });
}
