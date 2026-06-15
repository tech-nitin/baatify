'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessage: false,
    },
  });

  const { watch, setValue } = form;

  const acceptMessage = watch('acceptMessage');

  const handleDeleteMessage = (messageId: string) => {
    setMessages(
      messages.filter(
        (message) => message._id.toString() !== messageId
      )
    );
  };

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);

    try {
      const response =
        await axios.get<ApiResponse>(
          '/api/accept-messages'
        );

      setValue(
        'acceptMessage',
        response.data.isAcceptingMessages ?? false
      );

    } catch (error) {

      const axiosError =
        error as AxiosError<ApiResponse>;

      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to fetch settings',
        variant: 'destructive',
      });

    } finally {
      setIsSwitchLoading(false);
    }

  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh = false) => {

      setIsLoading(true);

      try {

        const response =
          await axios.get<ApiResponse>(
            '/api/get-messages'
          );

        setMessages(
          response.data.messages || []
        );

        if (refresh) {
          toast({
            title: 'Messages refreshed',
            description:
              'Latest messages loaded',
          });
        }

      } catch (error) {

        const axiosError =
          error as AxiosError<ApiResponse>;

        toast({
          title: 'Error',
          description:
            axiosError.response?.data.message ??
            'Failed to fetch messages',
          variant: 'destructive',
        });

      } finally {
        setIsLoading(false);
      }
    },

    [toast]
  );

  useEffect(() => {

    if (!session?.user) return;

    fetchMessages();

    fetchAcceptMessages();

  }, [
    session,
    fetchMessages,
    fetchAcceptMessages,
  ]);

  const handleSwitchChange = async () => {

    try {

      const response =
        await axios.post<ApiResponse>(
          '/api/accept-messages',
          {
            acceptMessage: !acceptMessage,
          }
        );

      setValue(
        'acceptMessage',
        !acceptMessage
      );

      toast({
        title: response.data.message,
      });

    } catch (error) {

      const axiosError =
        error as AxiosError<ApiResponse>;

      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to update setting',

        variant: 'destructive',
      });
    }
  };

  if (!session?.user) {
    return null;
  }

  const { username } =
    session.user as User;

  const profileUrl = `${window.location.origin}/u/${username}`;

  const copyToClipboard = () => {

    navigator.clipboard.writeText(
      profileUrl
    );

    toast({
      title: 'Copied',
      description:
        'Profile URL copied',
    });
  };

  return (

    <div className="container mx-auto max-w-6xl px-6 py-10">

      <h1 className="text-5xl font-bold mb-10">

        User Dashboard

      </h1>

      {/* Link section */}

      <div className="mb-8">

        <h2 className="text-2xl font-semibold mb-4">

          Copy Your Unique Link

        </h2>

        <div className="flex gap-3">

          <input
            type="text"
            value={profileUrl}
            disabled
            className="
            flex-1
            h-12
            rounded-md
            border
            border-gray-300
            bg-gray-50
            px-4
            text-gray-700
            "
          />

          <Button
            onClick={copyToClipboard}
            className="
            bg-slate-900
            hover:bg-slate-800
            text-white
            px-6
            "
          >
            Copy
          </Button>

        </div>

      </div>

      {/* Switch */}

      <div className="flex items-center gap-4 mb-8">

  <Switch
    checked={acceptMessage ?? false}
    onCheckedChange={handleSwitchChange}
    disabled={isSwitchLoading}
  />

  <span className="font-medium">

    Accept Messages

  </span>

  <span
    className={`
      px-3
      py-1
      rounded-full
      text-sm
      font-semibold

      ${
        acceptMessage
  ? 'bg-slate-900 text-white'
  : 'bg-slate-200 text-slate-700'
      }
    `}
  >

    {acceptMessage ? 'ON' : 'OFF'}

  </span>

</div>
      <Separator />

      {/* Refresh */}

      <div className="my-6">

        <Button

          variant="outline"

          onClick={(e) => {

            e.preventDefault();

            fetchMessages(true);

          }}

        >

          {isLoading ? (

            <Loader2
              className="
              h-4
              w-4
              animate-spin
              "
            />

          ) : (

            <>

              <RefreshCcw
                className="
                h-4
                w-4
                mr-2
                "
              />

              Refresh

            </>

          )}

        </Button>

      </div>

      {/* Messages */}

      <div
        className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-6
        "
      >

        {messages.length > 0 ? (

          messages.map((message) => (

            <MessageCard

              key={message._id.toString()}

              message={message}

              onMessageDelete={
                handleDeleteMessage
              }

            />

          ))

        ) : (

          <div
            className="
            col-span-2
            text-center
            py-16
            "
          >

            <p className="text-gray-500">

              No messages to display

            </p>

          </div>

        )}

      </div>

    </div>

  );
}

export default UserDashboard;