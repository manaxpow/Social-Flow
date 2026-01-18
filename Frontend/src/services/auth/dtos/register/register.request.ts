import type { Gender } from "@/lib/zod/auth/register.schema";

export interface RegisterRequest {
  email: string;
  password: string;
  dateOfBirth: Date;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  gender?: Gender;
}
