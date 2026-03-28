import { z } from "zod";

export const createPropertySchema = z.object({
  body: z.object({
    property_name: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    area: z.string().min(1),
    access_notes: z.string().optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
  }),
  params: z.object({
    userId: z.string().optional(),
  }),
});

export const updatePropertySchema = z.object({
  body: z.object({
    property_name: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
    area: z.string().min(1).optional(),
    access_notes: z.string().optional().nullable(),
    lat: z.number().optional().nullable(),
    lng: z.number().optional().nullable(),
  }),
  params: z.object({
    id: z.string(),
  }),
});
