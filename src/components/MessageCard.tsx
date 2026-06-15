'use client';

import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { X } from 'lucide-react';

import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';

import { useToast } from '@/components/ui/use-toast';

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export function MessageCard({
  message,
  onMessageDelete,
}: MessageCardProps) {

  const { toast } = useToast();

  const handleDeleteConfirm = async () => {

    try {

      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );

      toast({
        title: response.data.message,
      });

      onMessageDelete(message._id.toString());

    } catch (error) {

      const axiosError = error as AxiosError<ApiResponse>;

      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to delete message',

        variant: 'destructive',
      });
    }
  };

  return (

    <Card className="border rounded-lg shadow-sm hover:shadow-md transition-all">

      <CardHeader>

        <div className="flex items-start justify-between">

          <div className="flex-1">

            <CardTitle className="text-3xl font-bold pr-4">

              {message.content}

            </CardTitle>

            <p className="mt-3 text-sm text-gray-500">

              {dayjs(message.createdAt).format(
                'MMM D, YYYY h:mm A'
              )}

            </p>

          </div>

          <AlertDialog>

            <AlertDialogTrigger asChild>

              <Button
                size="icon"
                className="h-12 w-12 bg-red-500 hover:bg-red-600 text-white"
              >

                <X className="h-5 w-5" />

              </Button>

            </AlertDialogTrigger>

            <AlertDialogContent>

              <AlertDialogHeader>

                <AlertDialogTitle>

                  Delete this message?

                </AlertDialogTitle>

                <AlertDialogDescription>

                  This action cannot be undone.

                </AlertDialogDescription>

              </AlertDialogHeader>

              <AlertDialogFooter>

                <AlertDialogCancel>

                  Cancel

                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                >

                  Delete

                </AlertDialogAction>

              </AlertDialogFooter>

            </AlertDialogContent>

          </AlertDialog>

        </div>

      </CardHeader>

    </Card>
  );
}