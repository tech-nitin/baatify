import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { success, z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const queryParam = { username: searchParams.get("username") };

        // Validate with zod
        const user = UsernameQuerySchema.safeParse(queryParam);
        console.log( user); //TODO: remove this log

        if (!user.success) {
            const usernameErrors = user.error.format().username?._errors || []
            return Response.json(
                { success: false, 
                    message: "Invalid username format" },
            {
                status: 400
            });
        }

        const { username } = user.data;

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUser) {
            return Response.json(
                { success: false, 
                    message: "Username is already taken" },
            {
                status: 409
            });
        }

        return Response.json(
            { success: true, 
                message: "Username is available" },
        {
            status: 400
        });

    } catch (error) {
        console.error("Error checking username uniqueness:", error);
        return Response.json(
            { success: false, 
                message: "Error checking username uniqueness" },
        {
            status: 500
        });
    }
}