import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");   // not logged in → go away

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl">Hi {session.user.name ?? session.user.email} 👋</h1>
      <form action={logout}>
        <Button>Log out</Button>
      </form>
    </main>
  );
}
