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

export async function toggleAlertTraitee(id) {
  const { data } = await apiClient.patch(`/alerts/${id}/traiter`);
  return data;
}
