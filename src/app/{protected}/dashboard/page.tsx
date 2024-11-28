'use client';

import { useUser } from "@clerk/nextjs";

const DashboardPage = () => {
  const user = useUser();
  console.log("useUser Hook Output:", user); // Debugging output

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default DashboardPage;
