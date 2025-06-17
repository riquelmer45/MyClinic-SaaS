"use server";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertAppointmentSchema } from "./schema";

dayjs.extend(utc);

export const upsertAppointment = actionClient
  .schema(upsertAppointmentSchema)
  .action(async ({ parsedInput }) => {
    const { date, time, ...rest } = parsedInput;

    // Combine date and time into a single timestamp
    const [hours, minutes] = time.split(":").map(Number);
    const appointmentDate = dayjs(date)
      .set("hour", hours)
      .set("minute", minutes)
      .set("second", 0)
      .toDate();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuario não autenticado");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clinica não encontrada");
    }

    await db
      .insert(appointmentsTable)
      .values({
        ...rest,
        pacientId: parsedInput.patientId, // Note schema uses pacientId (with a 'c')
        id: parsedInput.id,
        clinicId: session?.user.clinic?.id,
        date: appointmentDate,
      })
      .onConflictDoUpdate({
        target: [appointmentsTable.id],
        set: {
          ...rest,
          pacientId: parsedInput.patientId,
          date: appointmentDate,
        },
      });

    revalidatePath("/appointments");
  });
