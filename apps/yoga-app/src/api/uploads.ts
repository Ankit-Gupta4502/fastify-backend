import { API_ENDPOINTS } from "@yoga-app/shared";
import { API_BASE_URL } from "../lib/http";

export interface UploadResult {
  url: string;
  key: string;
}

export const uploadsApi = {
  uploadAttachment: async (file: File): Promise<{ data: UploadResult }> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOADS.ATTACHMENT}`, {
      method: "POST",
      credentials: "include",
      body: form,
    });

    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(json.message ?? "Upload failed");
    }

    const json = (await res.json()) as { data: UploadResult };
    return json;
  },
};
