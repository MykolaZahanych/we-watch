export interface Profile {
  id: number;
  userId: number;
  additionalInfo: string | null;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileData {
  additionalInfo?: string;
  members: string[];
}

export type UpdateProfileData = Partial<CreateProfileData>;

