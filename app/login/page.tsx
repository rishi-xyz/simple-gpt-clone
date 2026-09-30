import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { login } from "@/app/actions";
import { AuthForm } from "@/components/auth-form";
import { OAuthButtons } from "@/components/oauth-buttons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function LoginPage() {
  // Already logged in? Go straight to the chat.
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Log in to continue chatting</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AuthForm action={login} submitLabel="Log in" />
          <Separator />
          <OAuthButtons />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
