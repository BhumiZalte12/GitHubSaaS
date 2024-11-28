'use client';

import React from "react";
import { useUser } from "@clerk/nextjs";

const DashboardPage = () => {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return <div>You need to sign in to access the dashboard.</div>;
  }

  return (
    <div>
      
      <p> {user?.firstName}</p>
      <p>{user?.lastName}</p>
    </div>
  );
};

export default DashboardPage;
