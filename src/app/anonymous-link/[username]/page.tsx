'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import { ApiResponse } from '@/types/ApiResponse';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const methods = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const { register, handleSubmit, watch, reset, formState } = methods;
  const { errors } = formState;
  const messageContent = watch('content');

  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      console.log("Sending Data:", { ...data, username });
  
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });
  
      console.log("Full Response:", response);
      console.log("Response Data:", response.data);
  
      alert(response.data?.message || "No message returned");
      reset({ content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error("Axios Error:", axiosError.response?.data);
      alert(axiosError.response?.data?.message ?? 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const fetchSuggestedMessages = async () => {
    setIsSuggestLoading(true);
    setFetchError(null);
    try {
      const response = await axios.post('/api/suggest-messages');
      const textResponse = response.data.questions;
      setSuggestedMessages(parseStringMessages(textResponse));
    } catch (error) {
      setFetchError('Failed to fetch messages. Please try again.');
      console.error('Error fetching messages:', error);
    } finally {
      setIsSuggestLoading(false);
    }
  };

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded shadow-md max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">
              Send Anonymous Message to @{username}
            </label>
            <textarea
              {...register('content')}
              placeholder="Write your anonymous message here"
              className="w-full p-2 border rounded-md resize-none"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            {isLoading ? (
              <button
                type="button"
                className="px-4 py-2 bg-gray-500 text-white rounded flex items-center"
                disabled
              >
                Please wait...
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={isLoading || !messageContent}
              >
                Send It
              </button>
            )}
          </div>
        </form>
      </FormProvider>

      <div className="space-y-4 my-8">
        <button
          onClick={fetchSuggestedMessages}
          className="px-4 py-2 bg-black text-white rounded hover:bg-zinc-600 disabled:opacity-50"
          disabled={isSuggestLoading}
        >
          {isSuggestLoading ? 'Fetching...' : 'Suggest Messages'}
        </button>

        <p>Click on any message below to select it.</p>

        <div className="border p-4 rounded-md">
          <h3 className="text-xl font-semibold mb-4">Messages</h3>
          {fetchError ? (
            <p className="text-red-500">{fetchError}</p>
          ) : (
            suggestedMessages.map((message, index) => (
              <button
                key={index}
                className="w-full text-left border p-2 rounded-md mb-2 hover:bg-gray-100"
                onClick={() => methods.setValue('content', message)}
              >
                {message}
              </button>
            ))
          )}
        </div>
      </div>

      <hr className="my-6" />

      <div className="text-center">
        <p className="mb-4">Get Your Message Board</p>
        <Link href="/sign-up">
          <button className="px-4 py-2 bg-black text-white rounded hover:bg-zinc-600">
            Create Your Account
          </button>
        </Link>
      </div>
    </div>
  );
}
