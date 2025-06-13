import { z } from "zod";

export const upsertDoctorSchema = z
  .object({
    id: z.string().uuid().optional(),
    clinicId: z.string().uuid().optional(),
    name: z.string().trim().min(1, "Nome é obrigatório"),
    specialty: z.string().trim().min(1, "Especialidade é obrigatória"),
    appointmentPriceInCents: z
      .number()
      .min(1, "Preço da consulta é obrigatório"),
    availableFromWeekDay: z.number().min(0).max(6),
    availableToWeekDay: z.number().min(0).max(6),
    availableFromTime: z
      .string()
      .trim()
      .min(1, "Horário de início é obrigatório"),
    availableToTime: z
      .string()
      .trim()
      .min(1, "Horário de término é obrigatório"),
  })
  .refine(
    (data) => {
      return data.availableFromTime < data.availableToTime;
    },
    {
      message: "Horário de início não pode ser anterior ao horário de término",
      path: ["availableToTime"],
    },
  );

export type UpsertDoctorSchema = z.infer<typeof upsertDoctorSchema>;
