import { apiRequest } from "../auth/authApi";

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
  const result = await apiRequest<ChildProfile[]>("/api/children");
  return result.data;
}

export async function createChild(input: CreateChildInput) {
  const result = await apiRequest<ChildProfile>("/api/children", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return result.data;
}

export async function uploadChildProfileImage(childProfileId: number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const result = await apiRequest<ChildProfile>(`/api/children/${childProfileId}/profile-image`, {
    method: "POST",
    body: formData,
  });
  return result.data;
}
