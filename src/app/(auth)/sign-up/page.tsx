"use client"

import type { ApiResponse } from "@/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDebounceValue, } from "usehooks-ts"
import { toast } from "sonner"
import axios, { type AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import type * as z from "zod"
import { Loader2 } from "lucide-react"

export default function SignUpForm() {
  const [username, setUsername] = useState("")
  const [usernameMessage, setUsernameMessage] = useState("")
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [debouncedUsername] = useDebounceValue(username, 600)
  const router = useRouter()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (!debouncedUsername) {
      setUsernameMessage("");  // Clear message if empty
      return;
    }
  
    const checkUsernameUnique = async () => {
      setIsCheckingUsername(true);
      setUsernameMessage(""); 
  
      try {
        const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${debouncedUsername}`);
        setUsernameMessage(response.data.message);
      } catch (error) {
        console.error("Username check error:", error);
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(axiosError.response?.data.message ?? "Error checking username");
      } finally {
        setIsCheckingUsername(false);
      }
    };
  
    checkUsernameUnique();
  }, [debouncedUsername]); // ✅ Only runs when debouncedUsername changes
  
  
  

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>("/api/sign-up", data)
      toast.success("Success!", { description: response.data.message })
      router.replace(`/verify/${username}`)
      setIsSubmitting(false)
    } catch (err) {
      console.error("Error during sign-up:", err)
      const axiosError = err as AxiosError<ApiResponse>
      // Default error message
      const errorMessage =
        axiosError.response?.data.message || "There was a problem with your sign-up. Please try again."

      toast("Sign Up Failed", {
        description: errorMessage,
        style: { backgroundColor: "red", color: "white" },
      })

      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join True Feedback</h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  form.formState.errors.username ? "border-red-500" : "border-gray-300"
                }`}
                {...form.register("username", {
                  onChange: (e) => setUsername(e.target.value),
                })}
              />
              {isCheckingUsername && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {!isCheckingUsername && usernameMessage && (
              <p className={`text-sm ${usernameMessage === "Username is unique" ? "text-green-500" : "text-red-500"}`}>
                {usernameMessage}
              </p>
            )}
            {form.formState.errors.username && (
              <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.formState.errors.email ? "border-red-500" : "border-gray-300"
              }`}
              {...form.register("email")}
            />
            <p className="text-gray-400 text-sm">We will send you a verification code</p>
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Please wait</span>
              </div>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

