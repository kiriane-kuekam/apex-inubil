import { apiClient } from "./client";

export async function fetchStudents(params = {}) {
  const { data } = await apiClient.get("/students", { params });
  return data;
}

export async function fetchStudent(id) {
  const { data } = await apiClient.get(`/students/${id}`);
  return data;
}

export async function fetchDashboardSummary() {
  const { data } = await apiClient.get("/dashboard/summary");
  return data;
}

export async function fetchAlerts() {
  const { data } = await apiClient.get("/alerts");
  return data;
}

export async function toggleAlertTraitee(id, note) {
  const { data } = await apiClient.patch(`/alerts/${id}/traiter`, { note });
  return data;
}

export async function importStudents(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/students/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
