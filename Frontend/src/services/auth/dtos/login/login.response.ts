import type { UserResponse } from "@/services/user/dtos/user.reponse";

export interface LoginResponse {
  user: UserResponse;
  token: string;
}
