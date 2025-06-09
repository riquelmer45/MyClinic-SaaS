import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import SignOutButton from "./_components/sing-out-button";

const Dashboad = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
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
