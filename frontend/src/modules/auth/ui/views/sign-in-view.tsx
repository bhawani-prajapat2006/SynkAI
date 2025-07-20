"use client";
import { z } from "zod";
import { OctagonAlertIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FaGoogle, FaGithub, FaGit } from "react-icons/fa"

import {
  Form,
  FormLabel,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

export default function SignInView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/"
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push('/');
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  };

  const onSocial = (provider: "github" | "google") => {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/"
      },
      {
        onSuccess: () => {
          setPending(false);
          router.push('/');
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 text-green-700">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-3xl text-green-900/90 mb-2 font-bold">
                    Log in
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your account!
                  </p>
                </div>

                <div className="grid gap-3 text-green-900/90">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            className="border border-green-900/90"
                            type="email"
                            placeholder="hello@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3 text-green-900/90">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            className="border border-green-900/90"
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full cursor-pointer"
                >
                  Log in
                </Button>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-6/10 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-green-900 relative z-10 px-2">
                    or
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    className="w-full cursor-pointer border-2 border-green-900/90 text-green-900/90"
                    disabled={pending}
                    type="button"
                    onClick={() => onSocial("google")}
                    variant="outline"
                  >
                    <FaGoogle /> Log in with Google
                  </Button>

                  <Button
                    className="w-full cursor-pointer border-2 border-green-900/90 text-green-900/90"
                    disabled={pending}
                    type="button"
                    onClick={() => onSocial("github")}
                    variant="outline"
                  >
                    <FaGithub /> Log in with Github
                  </Button>
                </div>

                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="underline underline-offset-4 font-semibold text-green-900/90"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className="bg-radial from-sidebar-accent to-sidebar relative hidden md:flex gap-y-4 items-center justify-center">
            <img
              src="/logo.svg"
              alt="logo"
              className="h-[102px] w-[102px] pe-5"
            />
            <p className="text-5xl text-green-300 font-semibold">synk.ai</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balnace *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of services</a>{" "}
        and <a href="#">Privacy policy</a>
      </div>
    </div>
  );
}
