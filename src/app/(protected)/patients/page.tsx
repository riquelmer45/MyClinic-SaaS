import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHearderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { pacientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AddPatientButton from "./_components/add-patient-button";
import PatientCard from "./_components/patient-card";

export default async function PatientsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session?.user.clinic) {
    redirect("/clinic-form");
  }

  const patients = await db.query.pacientsTable.findMany({
    where: eq(pacientsTable.clinicId, session.user.clinic.id),
    orderBy: (patients) => [patients.name],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHearderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            Gerenciamento de pacientes da clínica
          </PageDescription>
        </PageHearderContent>
        <PageActions>
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-3 gap-6">
          {patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
}
