"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const { data: session } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = () => {
    authClient.signUp.email(
      {
        email,
        name,
        password,
      },
      {
        onError: () => {
          window.alert("Something went wrong!");
        },
        onSuccess: () => {
          window.alert("Success!");
        },
      }
    );
  };

  const onLogin = () => {
    authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: () => {
          window.alert("Something went wrong!");
        },
        onSuccess: () => {
          window.alert("Success!");
        },
      }
    );
  };

  if (session) {
    return (
      <div className="flex flex-col gap-y-4 items-center p-10">
        <p>Logged in as {session.user.name}</p>
        <Button className="w-full" onClick={() => authClient.signOut()}>Sign out</Button>
      </div>
    );
  }

  return (
    <div>

      <div className="p-10 items-center flex flex-col gap-y-4">
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button className="w-40" onClick={onLogin}>
        Login
      </Button>
    </div>

    <div className="p-10 items-center flex flex-col gap-y-4">
      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button className="w-40" onClick={onSubmit}>
        Create User
      </Button>
    </div>

    </div>
  );
}
