import { db } from "@/server/db";
import React from "react";
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";

type Props = {
    params: Promise<{ projectId: string }>;
};

const JoinHandler = async (props: Props) => {
    const { projectId } = await props.params;
    const { userId } = await auth();
    
    if (!userId) return redirect("/sign-in");

    const dbuser = await db.user.findUnique({
        where: {
            id: userId,
        },
    });

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!dbuser) {
        await db.user.create({
            data: {
                id: userId,
                emailAddress: user.emailAddresses[0]?.emailAddress,
                imageUrl: user.imageUrl,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    }

    const project = await db.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) return redirect("/dashboard");

    // Check if the user is already associated with the project
    const existingAssociation = await db.userToProject.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId,
            },
        },
    });

    // If the association already exists, skip the creation
    if (existingAssociation) {
        return redirect(`/dashboard`);
    }

    try {
        await db.userToProject.create({
            data: {
                userId,
                projectId,
            },
        });
    } catch (error) {
        console.error(error);
    }

    return redirect(`/dashboard`);
};

export default JoinHandler;
