"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { signInSchema } from "@/schemas/signInSchema";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const Page = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });
  
    if (result?.error) {
      console.error("Sign-in error:", result.error); // Log the actual error for debugging
  
      if (result.error.toLowerCase().includes("unauthorized") || result.error === "credentialsSignin") {
        toast("Unauthorized", { description: "Incorrect username or password", style: { backgroundColor: "red", color: "white" }, },);
        // alert("Incorrect username or password")
      } else if (result.error.toLowerCase().includes("verify")) {
        toast("Verify Email", { description: "Please check your email for verification",style: { backgroundColor: "red", color: "white" }, });
        // alert("Please check your email for verification")
      } else {
        toast("Error", { description: result.error, style: { backgroundColor: "red", color: "white" }, });
        // alert(result.error)
      }
      return;
    }
  
    if (result?.url) {
      router.replace("/dashboard");
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to True Feedback
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email/Username Input */}
          <div className="space-y-2">
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
              Email/Username
            </label>
            <input
              id="identifier"
              type="text"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.formState.errors.identifier ? "border-red-500" : "border-gray-300"
              }`}
              {...form.register("identifier")}
            />
            {form.formState.errors.identifier && (
              <p className="text-sm text-red-500">{form.formState.errors.identifier.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.formState.errors.password ? "border-red-500" : "border-gray-300"
              }`}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Page;
