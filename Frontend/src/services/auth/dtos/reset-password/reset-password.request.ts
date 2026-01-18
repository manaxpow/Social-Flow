import type { ConfirmEmailRequest } from "../confirm-email/confirm-email.request";

export interface ResetPasswordRequest extends ConfirmEmailRequest {
  password: string;
}
