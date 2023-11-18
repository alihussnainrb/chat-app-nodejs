"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import apiClient from "@/lib/api";
import useAuthUser from "@/lib/stores/use-auth";
import { SignUpSchema, signUpSchema } from "@/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function Page() {
  const router = useRouter();
  const { authUser } = useAuthUser();
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (authUser) router.replace("/");
  }, [authUser, router]);

  const handleSubmit = async (values: SignUpSchema) => {
    console.log(values);
    const res = await apiClient.auth.signup(values);
    if (res.succeed && res.data) {
      return router.replace("/");
    }
    if (!res.succeed) {
      if (res.reason === "DUPLICATE") {
        form.setError("username", {
          message: "Username already registered!",
          type: "validate",
        });
      }
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center py-20">
      <div className="max-w-xl rounded-lg shadow-lg w-full p-10">
        <h2 className="text-xl font-semibold uppercase text-center">Sign In</h2>
        <div className="mt-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      {fieldState.error && <FormMessage />}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      {fieldState.error && <FormMessage />}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      {fieldState.error && <FormMessage />}
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  size={"lg"}
                  className="w-full"
                  disabled={
                    form.formState.isSubmitting || !form.formState.isDirty
                  }
                >
                  {form.formState.isSubmitting ? <Spinner /> : "Coninue"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        <div className="mt-8">
          <p className="text-center">
            Already have an account?{" "}
            <Link href={"/signin"} className="text-blue-500 underline">
              Signin here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
