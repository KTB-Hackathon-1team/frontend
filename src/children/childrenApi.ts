import { apiRequest } from "../lib/apiClient";

export type ChildGender = "MALE" | "FEMALE";

export type ChildProfile = {
  id: number;
  name: string;
  birthDate: string;
  gender: ChildGender;
  profileImageUrl: string | null;
};

export type CreateChildInput = {
  name: string;
  birthDate: string;
  gender: ChildGender;
};

export async function getChildren() {
  return apiRequest<ChildProfile[]>("/api/children");
}

export async function createChild(input: CreateChildInput) {
  return apiRequest<ChildProfile>("/api/children", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadChildProfileImage(childProfileId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<ChildProfile>(`/api/children/${childProfileId}/profile-image`, {
    method: "POST",
    body: formData,
  });
}
