"use client";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormSchema, SignUpFormSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { Loader2Icon, MailCheck, MailCheckIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import logo from "../../../../public/cypresslogo.svg";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { actionSignUpUser } from "@/lib/server-actions/auth-actions";

const SignUp = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | undefined>("");
  const [confirmation, setConfirmation] = useState<boolean | undefined>(false);

  const searchParams = useSearchParams();

  const codeExchangeError = useMemo(() => {
    if (!searchParams) return;

    return searchParams.get("error_description");
  }, [searchParams]);

  const confirmationAndErrorStyles = useMemo(
    () =>
      clsx("bg-primary", {
        "bg-red-500/10": codeExchangeError,
        "border-red-500/50": codeExchangeError,
        "text-red-700": codeExchangeError,
      }),
    [codeExchangeError]
  );

  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async ({
    email,
    password,
  }) => {
    const response = await actionSignUpUser({ email, password });

    if (response.error) {
      form.reset();
      setSubmitError(response.error.message);
      return;
    }

    setConfirmation(true);
  };
  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError("");
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        <Link href="/" className="w-full flex justify-start items-center">
          <Image src={logo} alt="brainbox logo" width={50} height={50} />

          <span className="font-semibold dark:text-white text-4xl ml-2">
            brainbox.{" "}
          </span>
        </Link>

        <FormDescription className="text-foreground/60">
          {" "}
          An All-In-One Collaboration And Productivity Platform.
        </FormDescription>

        {!confirmation && !codeExchangeError && (
          <>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full p-6" disabled={isLoading}>
              {!isLoading ? (
                "Create Account"
              ) : (
                <Loader2Icon className="h-6 w-6 animate-spin" />
              )}
            </Button>
          </>
        )}

        {submitError && <FormMessage>{submitError}</FormMessage>}
        <span className="self-container">
          Already Have An Account?
          <Link href="/login" className="text-primary ml-1">
            Login
          </Link>
        </span>

        {(confirmation || codeExchangeError) && (
          <>
            <Alert className={confirmationAndErrorStyles}>
              {!codeExchangeError && <MailCheckIcon className="h-4 w-4" />}
              <AlertTitle>
                {codeExchangeError ? "Invalid Link" : "Check Your Email."}
              </AlertTitle>
              <AlertDescription>
                {codeExchangeError || "An email confirmation has been sent."}
              </AlertDescription>
            </Alert>
          </>
        )}
      </form>
    </Form>
  );
};

export default SignUp;
