import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import LoginForm from "./components/login-form";
import SignUpForm from "./components/sign-up-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Tabs defaultValue="Login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Login">Account</TabsTrigger>
          <TabsTrigger value="Register">Cria conta</TabsTrigger>
        </TabsList>
        <TabsContent value="Login">
          <LoginForm />
        </TabsContent>
        <TabsContent value="Register">
          <SignUpForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthenticationPage;
