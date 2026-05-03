export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  avatarUrl?: string;
  bio?: string;
  coverUrl?: string;
  createdAt?: string;
  followingCount?: number;
  followersCount?: number;
}
