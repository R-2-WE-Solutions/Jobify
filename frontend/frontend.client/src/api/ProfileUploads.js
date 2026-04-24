import { api } from "./api";

export async function uploadResume(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await api.post("/profile/student/resume", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function uploadUniversityProof(file) {
  const form = new FormData();
  form.append("uploadedFile", file);

  const res = await api.post("/profile/student/university-proof", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function deleteResume() {
  const res = await api.delete("/profile/student/resume");
  return res.data;
}

export async function deleteUniversityProof() {
  const res = await api.delete("/profile/student/university-proof");
  return res.data;
}

function getDownloadFileName(contentDisposition, fallbackName) {
  if (!contentDisposition) return fallbackName;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const simpleMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (simpleMatch?.[1]) {
    return simpleMatch[1];
  }

  return fallbackName;
}

async function downloadWithAuth(path, fallbackName) {
  const res = await api.get(path, {
    responseType: "blob",
  });

  const contentDisposition = res.headers["content-disposition"];
  const fileName = getDownloadFileName(contentDisposition, fallbackName);

  const blobUrl = window.URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export async function downloadResumeFile() {
  return downloadWithAuth("/profile/student/resume", "resume");
}

export async function downloadUniversityProofFile() {
  return downloadWithAuth("/profile/student/university-proof", "university_proof");
}