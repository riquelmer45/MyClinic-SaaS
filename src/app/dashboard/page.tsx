import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import SignOutButton from "./components/sing-out-button";

const Dashboad = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/authentication");
  }
  const clinic = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, session.user.id),
  });

  if (clinic.length === 0) {
    redirect("/clinic-form");
  }

  return (
    <div>
      <h1>Dashborad</h1>
      <p>Bem-vindo, {session?.user?.name || "Usuário"}</p>
      <p>Email: {session?.user?.email || "Email não disponível"}</p>
      <SignOutButton />
    </div>
  );
};

export default Dashboad;
