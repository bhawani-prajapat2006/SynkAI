"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomeView() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-col gap-y-4 items-center p-10">
      <p>Logged in as {session.user.name}</p>
      <Button
        className="w-full cursor-pointer"
        onClick={() =>
          authClient.signOut({
            fetchOptions: { onSuccess: () => router.push("/auth/sign-in") },
          })
        }
      >
        Sign out
      </Button>
    </div>
  );
}
