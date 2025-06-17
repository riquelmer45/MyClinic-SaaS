import dayjs from "dayjs";
import { and, count, eq, gte, lte, sql, sum } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import AppointmentsChart from "./_components/AppointmentsChart";
import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-card";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const Dashboard = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const { from, to } = await searchParams;
  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }

  const [totalRevenue, totalAppointments, totalPatients, totalDoctors] =
    await Promise.all([
      db
        .select({
          total: sum(appointmentsTable.appointmentPriceInCents),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, new Date(from ? from : 0)),
            lte(appointmentsTable.date, new Date(to ? to : 0)),
          ),
        )
        .then((result) => result[0]),

      db
        .select({
          total: count(),
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.clinicId, session.user.clinic.id),
            gte(appointmentsTable.date, new Date(from ? from : 0)),
            lte(appointmentsTable.date, new Date(to ? to : 0)),
          ),
        )
        .then((result) => result[0]),

      db
        .select({
          total: count(),
        })
        .from(patientsTable)
        .where(and(eq(patientsTable.clinicId, session.user.clinic.id)))
        .then((result) => result[0]),

      db
        .select({
          total: count(),
        })
        .from(doctorsTable)
        .where(and(eq(doctorsTable.clinicId, session.user.clinic.id)))
        .then((result) => result[0]),
    ]);

  const chartStartDate = dayjs().subtract(10, "day").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "day").startOf("day").toDate();

  const DailyAppointmentsData = await db
    .select({
      date: sql<string>`DATE(${appointmentsTable.date})`.as("date"),
      appointments: count(appointmentsTable.id),
      revenue:
        sql<number>`COALESCE(SUM(${appointmentsTable.appointmentPriceInCents}), 0)`.as(
          "revenue",
        ),
    })
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        gte(appointmentsTable.date, chartStartDate),
        lte(appointmentsTable.date, chartEndDate),
      ),
    )
    .groupBy(sql`DATE(${appointmentsTable.date})`)
    .orderBy(sql`DATE(${appointmentsTable.date})`);
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Bem-vindo ao painel de controle da sua clínica. Aqui você pode ter
            uma visualização geral do desempenho da clínica.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCards
          totalRevenue={totalRevenue.total ? Number(totalRevenue.total) : null}
          totalAppointments={totalAppointments.total}
          totalPatients={totalPatients.total}
          totalDoctors={totalDoctors.total}
        />
        <div className="grid grid-cols-[2.25fr_1fr]">
          <AppointmentsChart dailyAppointmentsData={DailyAppointmentsData} />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default Dashboard;
