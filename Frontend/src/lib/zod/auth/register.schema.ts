import * as z from "zod";

export const genderSchema = z.enum(
  ["Male", "Female", "Other"],
  "Please select a valid gender."
);
export type Gender = z.infer<typeof genderSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),

    lastName: z.string().min(1, "Last name is required."),

    email: z.string().email("Please enter a valid email address."),

    dobDay: z.string().min(1, "Day is required."),

    dobMonth: z.string().min(1, "Month is required."),

    dobYear: z.string().min(1, "Year is required."),

    gender: genderSchema,

    password: z.string().min(8, "Password must be at least 8 characters."),

    confirmPassword: z.string().min(1, "Confirmation is required."),

    avatarUrl: z
      .string()
      .url("Invalid URL format")
      .optional()
      .or(z.literal("")),
    bio: z.string().max(160, "Bio must be under 160 characters.").optional(),
  })
  // 1. Check if Passwords match
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  // 2. Check if the Date is valid (e.g., prevent Feb 31st)
  .refine(
    (data) => {
      const day = parseInt(data.dobDay);
      const month = parseInt(data.dobMonth) - 1; // JS months are 0-indexed
      const year = parseInt(data.dobYear);
      const date = new Date(year, month, day);

      // If the date is invalid, JS "rolls over" (e.g. Feb 30 -> March 2)
      // We check if the date parts match what the user input.
      return (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      );
    },
    {
      message: "Please enter a valid date.",
      path: ["dobDay"], // Highlights the day selector
    }
  )
  // 3. Optional: Minimum Age check (e.g., 13 years old)
  .refine(
    (data) => {
      const birthDate = new Date(
        parseInt(data.dobYear),
        parseInt(data.dobMonth) - 1,
        parseInt(data.dobDay)
      );
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age >= 13;
    },
    {
      message: "You must be at least 13 years old.",
      path: ["dobYear"],
    }
  );

export type RegisterValues = z.infer<typeof registerSchema>;
