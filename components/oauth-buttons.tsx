import { loginWithGitHub, loginWithGoogle } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function OAuthButtons() {
  return (
    <div className="grid gap-2">
      <form action={loginWithGitHub}>
        <Button variant="outline" className="w-full">
          Continue with GitHub
        </Button>
      </form>
      <form action={loginWithGoogle}>
        <Button variant="outline" className="w-full">
          Continue with Google
        </Button>
      </form>
    </div>
  );
}
