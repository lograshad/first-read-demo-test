"use client";

import useUserData from "@/hooks/use-user-data";
import React from "react";
import InputField from "../chat/_components/input-field";

export default function NewChat() {
  const { data: user } = useUserData();
  const firstName =
    user?.data?.full_name?.split(" ")[1] ?? user?.data?.full_name ?? "there";
  return (
    <div className="h-screen w-full flex flex-col items-center mt-12 md:mt-0 md:justify-center">
      <div className="flex flex-col items-center w-full h-auto pt-15 md:pt-0">
        <div className="text-text-title text-center flex-1 -tracking-[3%] text-2xl font-semibold mb-5">
          {`Hello ${firstName}`}
          <span className="text-text-label ml-4 text-sm block">
            Tell me about your business to generate terms and conditions
          </span>
        </div>
        <div className="w-full max-w-[640px] min-w-2/5 space-y-4">
          <InputField />
        </div>
      </div>
    </div>
  );
}
