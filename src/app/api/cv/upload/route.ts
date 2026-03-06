import { apiOk, apiErr, auditLog } from "@/lib/utils/api";
import { uploadCvToStorage } from "@/lib/db/supabase";
import prisma from "@/lib/db/prisma";

const getUserId = () => "demo-user-id";

export async function POST(request: Request) {
  const userId = getUserId();

  // Check consent
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.consentCv) {
    return apiErr("CONSENT_REQUIRED", "Please consent to CV processing before uploading", [], 403);
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return apiErr("VALIDATION_ERROR", "No file uploaded");

  const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowedTypes.includes(file.type)) return apiErr("VALIDATION_ERROR", "Only PDF and DOCX files accepted");
  if (file.size > 10 * 1024 * 1024) return apiErr("VALIDATION_ERROR", "File exceeds 10 MB limit");

  // Upload to Supabase Storage
  const { key, error: uploadError } = await uploadCvToStorage(userId, file);
  if (uploadError) return apiErr("STORAGE_ERROR", uploadError, [], 500);

  // Create DB record
  const cv = await prisma.cv.create({
    data: {
      userId,
      fileKey: key,
      fileName: file.name,
      fileType: file.type,
      fileSizeBytes: file.size,
      status: "uploaded",
    },
  });

  await auditLog(prisma, { userId, action: "CV_UPLOADED", resourceType: "cv", resourceId: cv.id, metadata: { fileName: file.name, size: file.size } });

  return apiOk({ id: cv.id, fileName: cv.fileName, status: "uploaded" }, 201);
}
