import { z } from "zod";

export const FormSchema = z.object({
  email: z.string().describe("Email").email({
    message: "Invalid Email",
  }),

  password: z.string().describe("Password").min(1, "Password is Required"),
});

export const CreateWorkspaceFormSchema = z.object({
  workspaceName: z
    .string()
    .describe("Workspace Name")
    .min(1, "Workspace name must be min of 1 character"),
  workspaceLogo: z.any(),
});

export const SignUpFormSchema = z
  .object({
    email: z.string().describe("Email").email({ message: "Invalid Email" }),
    password: z
      .string()
      .describe("Password")
      .min(6, "Password must be minimum 6 characters "),

    confirmPassword: z
      .string()
      .describe("Password")
      .min(6, "Password must be minimum 6 characters "),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords Dont Match!!",
    path: ["confirmPassword"],
  });
