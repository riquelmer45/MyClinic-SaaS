import { z } from "zod";

export const upsertPatientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "Email inválido" }),
  phoneNumber: z.string().min(1, { message: "Telefone é obrigatório" }),
  sex: z.enum(["male", "female"], {
    required_error: "Sexo é obrigatório",
  }),
});

export type UpsertPatientFormValues = z.infer<typeof upsertPatientSchema>;
