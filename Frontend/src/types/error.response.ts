export interface ErrorApiResponse {
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string[]>;
  errorCode?: string;
  [key: string]: unknown;
}
