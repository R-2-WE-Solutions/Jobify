import { api } from "./api";

// ─── Skills ───────────────────────────────────────────────
export async function getSkills() {
  const res = await api.get("/profile/student/skills");
  return res.data;
}

export async function addSkill(name) {
  const res = await api.post("/profile/student/skills", { name });
  return res.data;
}

export async function deleteSkill(id) {
  const res = await api.delete(`/profile/student/skills/${id}`);
  return res.data;
}

// ─── Education ────────────────────────────────────────────
export async function getEducation() {
  const res = await api.get("/profile/student/education");
  return res.data;
}

export async function addEducation(data) {
  const res = await api.post("/profile/student/education", data);
  return res.data;
}

export async function updateEducation(id, data) {
  const res = await api.put(`/profile/student/education/${id}`, data);
  return res.data;
}

export async function deleteEducation(id) {
  const res = await api.delete(`/profile/student/education/${id}`);
  return res.data;
}

// ─── Experience ───────────────────────────────────────────
export async function getExperience() {
  const res = await api.get("/profile/student/experience");
  return res.data;
}

export async function addExperience(data) {
  const res = await api.post("/profile/student/experience", data);
  return res.data;
}

export async function updateExperience(id, data) {
  const res = await api.put(`/profile/student/experience/${id}`, data);
  return res.data;
}

export async function deleteExperience(id) {
  const res = await api.delete(`/profile/student/experience/${id}`);
  return res.data;
}

// ─── Projects ─────────────────────────────────────────────
export async function getProjects() {
  const res = await api.get("/profile/student/projects");
  return res.data;
}

export async function addProject(data) {
  const res = await api.post("/profile/student/projects", data);
  return res.data;
}

export async function updateProject(id, data) {
  const res = await api.put(`/profile/student/projects/${id}`, data);
  return res.data;
}

export async function deleteProject(id) {
  const res = await api.delete(`/profile/student/projects/${id}`);
  return res.data;
}

// ─── Interests ────────────────────────────────────────────
export async function getInterests() {
  const res = await api.get("/profile/student/interests");
  return res.data;
}

export async function addInterest(interest) {
  const res = await api.post("/profile/student/interests", { interest });
  return res.data;
}

export async function deleteInterest(id) {
  const res = await api.delete(`/profile/student/interests/${id}`);
  return res.data;
}