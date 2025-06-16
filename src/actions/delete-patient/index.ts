"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { pacientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

export const deletePatient = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }
    const patient = await db.query.pacientsTable.findFirst({
      where: eq(pacientsTable.id, parsedInput.id),
    });
    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    if (patient.clinicId !== session.user.clinic?.id) {
      throw new Error("Paciente não encontrado");
    }
    await db.delete(pacientsTable).where(eq(pacientsTable.id, parsedInput.id));

    revalidatePath("/patients");
  });
