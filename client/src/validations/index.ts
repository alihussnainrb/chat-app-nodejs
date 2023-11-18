import { z } from "zod";

export const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export type LocationSchema = z.infer<typeof locationSchema>;

export const signInSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z.string(),
  username: z.string(),
  password: z.string(),
  location: locationSchema.optional(),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
