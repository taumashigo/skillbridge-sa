import { createClient } from "@supabase/supabase-js";

// Server-side client (with service role key for admin operations)
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server env vars");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Browser-side client (with anon key, safe to expose)
export function createBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// Storage helper — upload CV to Supabase Storage
export async function uploadCvToStorage(
  userId: string,
  file: File
): Promise<{ key: string; error: string | null }> {
  const supabase = createServerSupabase();
  const ext = file.name.split(".").pop();
  const key = `cvs/${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("cv-uploads")
    .upload(key, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return { key: "", error: error.message };
  return { key, error: null };
}

// Storage helper — get signed URL for CV download
export async function getCvSignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.storage
    .from("cv-uploads")
    .createSignedUrl(key, expiresIn);

  if (error || !data) return null;
  return data.signedUrl;
}

// Storage helper — download CV as buffer (for parsing)
export async function downloadCvBuffer(key: string): Promise<Buffer> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.storage
    .from("cv-uploads")
    .download(key);

  if (error || !data) throw new Error(`Failed to download CV: ${error?.message}`);
  return Buffer.from(await data.arrayBuffer());
}

// Storage helper — delete CV
export async function deleteCvFromStorage(key: string): Promise<void> {
  const supabase = createServerSupabase();
  await supabase.storage.from("cv-uploads").remove([key]);
}
