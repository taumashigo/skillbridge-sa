import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Generic fetch helper
async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  return res.json();
}

// --- Profile ---
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiFetch("/api/profile"),
    enabled: false, // Enable in Phase 2 when API is wired
  });
}

// --- CV ---
export function useUploadCV() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      fetch("/api/cv/upload", { method: "POST", body: formData }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useParseCV() {
  return useMutation({
    mutationFn: (data: { cvId: string }) =>
      apiFetch("/api/cv/parse", { method: "POST", body: JSON.stringify(data) }),
  });
}

// --- Job ---
export function useIngestJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title?: string; description?: string; url?: string; level: string; timeline: string }) =>
      apiFetch("/api/job/ingest", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

// --- Assessment ---
export function useGenerateAssessment() {
  return useMutation({
    mutationFn: (data: { jobId: string }) =>
      apiFetch("/api/assessment/generate", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useSubmitAssessment() {
  return useMutation({
    mutationFn: (data: { assessmentId: string; answers: any }) =>
      apiFetch("/api/assessment/submit", { method: "POST", body: JSON.stringify(data) }),
  });
}

// --- Learning ---
export function useLearningRecommendations(jobId: string | null) {
  return useQuery({
    queryKey: ["learning", jobId],
    queryFn: () => apiFetch(`/api/learning/recommend?jobId=${jobId}`),
    enabled: !!jobId,
  });
}

// --- Podcast ---
export function useCreatePodcast() {
  return useMutation({
    mutationFn: (data: { jobId: string }) =>
      apiFetch("/api/podcast/create", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useRedirectPodcast() {
  return useMutation({
    mutationFn: (data: { episodeId: string; redirectText: string }) =>
      apiFetch("/api/podcast/redirect", { method: "POST", body: JSON.stringify(data) }),
  });
}

// --- CV Optimiser ---
export function useOptimiseCV() {
  return useMutation({
    mutationFn: (data: { cvId: string; jobId: string }) =>
      apiFetch("/api/cv-optimise", { method: "POST", body: JSON.stringify(data) }),
  });
}

// --- Interview ---
export function useStartInterview() {
  return useMutation({
    mutationFn: (data: { jobId: string; type: string }) =>
      apiFetch("/api/interview/start", { method: "POST", body: JSON.stringify(data) }),
  });
}

export function useInterviewFeedback() {
  return useMutation({
    mutationFn: (data: { sessionId: string; questionId: string; answer: string }) =>
      apiFetch("/api/interview/feedback", { method: "POST", body: JSON.stringify(data) }),
  });
}

// --- Data Management (POPIA) ---
export function useExportData() {
  return useMutation({
    mutationFn: () => apiFetch("/api/data/export"),
  });
}

export function useDeleteAllData() {
  return useMutation({
    mutationFn: () => apiFetch("/api/data/delete", { method: "DELETE" }),
  });
}
