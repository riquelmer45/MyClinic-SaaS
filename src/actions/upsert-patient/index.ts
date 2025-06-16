"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { pacientsTable, pacientStatusEnum } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./schema";

export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clínica não encontrada");
    }

    await db
      .insert(pacientsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: session?.user.clinic?.id,
        status: pacientStatusEnum.enumValues[1], // 'active'
      })
      .onConflictDoUpdate({
        target: [pacientsTable.id],
        set: {
          name: parsedInput.name,
          email: parsedInput.email,
          phoneNumber: parsedInput.phoneNumber,
          sex: parsedInput.sex,
        },
      });

    revalidatePath("/patients");
  });
