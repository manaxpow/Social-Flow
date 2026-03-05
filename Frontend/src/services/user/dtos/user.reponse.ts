export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  avatarUrl?: string;
  bio?: string;
}
