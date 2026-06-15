import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

import { getServerSession } from 'next-auth/next';

import { authOptions } from '../auth/[...nextauth]/options';

export async function GET() {

  await dbConnect();

  const session =
    await getServerSession(authOptions);

  if (!session?.user) {

    return Response.json(

      {

        success: false,

        message: 'Not authenticated',

      },

      {

        status: 401,

      }

    );

  }

  try {

    const user =
      await UserModel.aggregate([

        {

          $match: {

            email:

              session.user.email,

          },

        },

        {

          $unwind: {

            path: '$messages',

            preserveNullAndEmptyArrays:

              true,

          },

        },

        {

          $sort: {

            'messages.createdAt':

              -1,

          },

        },

        {

          $group: {

            _id: '$_id',

            messages: {

              $push:

                '$messages',

            },

          },

        },

      ]);

    return Response.json(

      {

        success: true,

        messages:

          user[0]?.messages ||

          [],

      },

      {

        status: 200,

      }

    );

  } catch (error) {

    console.error(

      'Error fetching messages:',

      error

    );

    return Response.json(

      {

        success: false,

        message:

          'Internal server error',

      },

      {

        status: 500,

      }

    );

  }

}