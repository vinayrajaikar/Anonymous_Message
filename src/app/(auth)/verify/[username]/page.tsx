"use client"

import { useParams, useRouter } from "next/navigation"
import { verifySchema } from "@/schemas/verifySchema"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { type AxiosError } from "axios"
import type { ApiResponse } from "@/types/ApiResponse"
import { toast } from "sonner"
import { useState } from "react"

export default function VerifyAccount() {
  const router = useRouter()
  const params = useParams() as { username: string }
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    console.log("onSubmit function called!")
    console.log("Params inside onSubmit:", params)
    console.log("Username:", params?.username)
    console.log("Verification code:", data.code)

    // Check if username is available in params
    if (!params.username) {
      toast.error("Missing username parameter")
      return
    }

    // Set submitting state
    setIsSubmitting(true)

    try {
      // Send the verification code entered by the user
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.code, // Use the actual user input
      })

      toast.success("Success!", { description: response.data.message })
      router.replace("/sign-in") // Redirect to sign-in after success
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>
      console.error("Verification error:", axiosError)

      toast.error("Verification Failed", {
        description: axiosError.response?.data.message ?? "An error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false) // Reset submitting state
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Verify Your Account</h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
          {params.username ? (
            <p className="text-sm text-gray-500">Verifying account: {params.username}</p>
          ) : (
            <p className="text-sm text-red-500">Username parameter is missing</p>
          )}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                form.formState.errors.code ? "border-red-500" : "border-gray-300"
              }`}
              {...form.register("code")}
            />
            {form.formState.errors.code && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.code.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || form.formState.isSubmitting}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  )
}
