import { auth , clerkClient, EmailAddress } from "@clerk/nextjs/server";
import { notFound ,redirect } from "next/navigation";
import React from 'react'
import { db } from '@/server/db'





const SyncUser = async () =>
{
const {userId} = await auth()
if(!userId){
    throw new Error("Uset not found")

}
const Client = await clerkClient()
const user = await Client.users.getUser(userId)
if(!user.emailAddresses[0]?.emailAddress){
    return notFound()
}
await db.user.upsert({
    where : {
        emailAddress: user.emailAddresses[0]?.emailAddress ?? ""
    },
    update: {
        imageUrl : user.imageUrl,
        firstName : user.firstName,
        lastName : user.lastName,
    },
    create: {
        id: userId,
        emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
    },
    

    

});
return redirect('/dashboard')
   
};

export default SyncUser