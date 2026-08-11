import { apiClient } from "./client";

export async function fetchAdminSummary() {
  const { data } = await apiClient.get("/admin/summary");
  return data;
}
