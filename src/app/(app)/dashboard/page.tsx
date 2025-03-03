'use client'

import {toast} from 'sonner'
import { Message } from "@/model/User"
import { useCallback, useEffect, useState } from "react"
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { MessageCard } from '@/components/MessageCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2, RefreshCcw } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const page = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSwitchLoading, setIsSwitchLoading] = useState(false)

  const {data: session} = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema)
  })

  const {register,watch,setValue}=form

  const acceptMessages = watch('acceptMessages')

  const fetchAcceptMessages = useCallback(async()=>{
    setIsSwitchLoading(true)
    try{
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      // console.log(response)
      setValue('acceptMessages', response.data.isAcceptingMessages ?? false );
    }
    catch(err){
      const axiosError = err as AxiosError<ApiResponse>;
      toast('Error',{
        description:axiosError.response?.data.message ??'Failed to fetch message settings',
      })
    } finally{
      setIsSwitchLoading(false);
    }
  },[setValue, toast])

  const fetchMessages = useCallback(async(refresh: boolean = false)=>{
    setIsLoading(true);
    setIsSwitchLoading(false);
    try{
      const response = await axios.get<ApiResponse>('/api/get-messages');
      console.log(response)
      setMessages(response.data.messages as Message[]|| []);
      if(refresh){
        toast('Refreshed Messages',{description:'Showing latest messages'})
      }
    }
    catch(err){
      const axiosError = err as AxiosError<ApiResponse>;
      toast('Error',{
        description: axiosError.response?.data.message ?? 'Failed to fetch messages',
      })
    }
    finally{
      setIsLoading(false);
      setIsSwitchLoading(false);
    }
  },[setIsLoading, setMessages, toast])

  useEffect(()=>{
    if(!session || !session.user) return;

    fetchMessages();
    fetchAcceptMessages();
  },[session, setValue, toast, fetchAcceptMessages, fetchMessages])

  const handleSwitchChange = async ()=>{
    try{
      const response = await axios.post<ApiResponse>('/api/accept-messages',{
        acceptMessages: !acceptMessages,
      })
      setValue('acceptMessages', !acceptMessages);
      toast('',{description:response.data.message})
    }
    catch(err){
      const axiosError = err as AxiosError<ApiResponse>;
      toast('Error',{description:axiosError.response?.data.message ??
        'Failed to update message settings',
      });
    }
  }

  if (!session || !session.user) {
    return <div>Please login</div>;
  }

  const { username } = session.user ;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/anonymous-link/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast(
      'URL Copied!',
      {description: 'Profile URL has been copied to clipboard.',}
    );
  };

  const handleDeleteMessage = (messageId:string)=>{
    console.log(messageId)
    setMessages(messages.filter((message)=>message.id!==messageId))    
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
    <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
      <div className="flex items-center">
        <input
          type="text"
          value={profileUrl}
          disabled
          className="input input-bordered w-full p-2 mr-2"
        />
        <Button onClick={copyToClipboard}>Copy</Button>
      </div>
    </div>

    <div className="mb-4">
      <Switch
        {...register('acceptMessages')}
        checked={acceptMessages}
        onCheckedChange={handleSwitchChange}
        disabled={isSwitchLoading}
      />
      <span className="ml-2">
        Accept Messages: {acceptMessages ? 'On' : 'Off'}
      </span>
    </div>
    <Separator />

    <Button
      className="mt-4"
      variant="outline"
      onClick={(e) => {
        e.preventDefault();
        fetchMessages(true);
      }}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCcw className="h-4 w-4" />
      )}
    </Button>
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {messages.length > 0 ? (
        messages.map((message) => (
          <MessageCard
            key={message.id}
            message={message}
            onMessageDelete={()=>handleDeleteMessage(message.id)}
          />
        ))
      ) : (
        <p>No messages to display.</p>
      )}
    </div>
  </div>
  )
}

export default page
