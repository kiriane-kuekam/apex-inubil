import { apiClient } from "./client";

export async function fetchFilieres() {
  const { data } = await apiClient.get("/filieres");
  return data;
}
