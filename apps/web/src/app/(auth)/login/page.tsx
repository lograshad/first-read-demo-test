"use client";

import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema, SignInSchemaType } from "@/lib/schemas/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/app/actions/auth";
import { getSession } from "next-auth/react";
import { Label } from "@repo/ui/components/label";
import { Input } from "@repo/ui/components/input";
import { Button } from "@repo/ui/components/button";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
  });
  const {
    handleSubmit,
    formState: { errors },
    register,
    watch,
  } = methods;

  const password = watch("password");
  const email = watch("email");

  const isFormFilled = Boolean(password && email);
  const router = useRouter();
  const onSubmit = async (data: SignInSchemaType) => {
    setLoginLoading(true);
    try {
      const res = await login({
        email: email.trim().toLowerCase(),
        password: data.password,
      });
      if (res?.error) {
        setLoginLoading(false);
        toast.error("An error occured");
        return;
      }

      toast.success("Welcome back to First Read!");

      const session = await getSession();

      if (!session) {
        throw new Error("Error signing in. Please try again.");
      }

      router.push("/");
    } catch (error) {
      setLoginLoading(false);
      toast.error(error instanceof Error ? error.message : "An error occured");
      return;
    }
  };
  return (
    <div>
      <h1 className="text-text-title mb-8 text-center text-2xl leading-[120%] font-semibold md:text-4xl">
        Welcome to First Read<span className="text-primary">.</span>
        <br />
      </h1>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-4.5"
        >
          <div className="flex flex-col gap-2.5">
            <Label className="px-2.5">Email</Label>
            <div className="relative w-full">
              <Input
                aria-invalid={errors.email ? "true" : "false"}
                type="email"
                className="px-6"
                placeholder="Input your email"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p aria-invalid="true" className="text-text-destructive text-xs">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="px-2.5">Password</Label>
            <div className="relative w-full">
              <Input
                aria-invalid={errors.password ? "true" : "false"}
                type={showPassword ? "text" : "password"}
                className="pr-10 pl-6"
                placeholder="Password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-label absolute top-1/2 right-3 -translate-y-1/2 transform"
              >
                {showPassword ? (
                  <EyeSlashIcon className="text-icon-title size-4 cursor-pointer stroke-[1.8px]" />
                ) : (
                  <EyeIcon className="text-icon-title size-4 cursor-pointer stroke-[1.8px]" />
                )}
              </button>
            </div>
            {errors.password && (
              <p aria-invalid="true" className="text-text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={loginLoading}
            disabled={!isFormFilled}
            className="mt-4 w-full py-6 text-xs"
          >
            Log in
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
