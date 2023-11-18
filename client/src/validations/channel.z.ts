import { z } from "zod";
import { locationSchema } from ".";

export const addChannelSchema = z.object({
  name: z.string(),
  location: locationSchema,
});

export type AddChannelSchema = z.infer<typeof addChannelSchema>;
