import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <main className="w-full m-2">
        {/* Top Bar */}
        <div className="flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4">
          {/* Add a Search Bar or other top-bar content */}
          {/* <SearchBar /> */}
          <div className="ml-auto">
            <UserButton />
          </div>
        </div>

        {/* Main Content Area with spacing */}
        <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] px-4 mt-4">
          {children ? (
            children
          ) : (
            <div className="text-center text-gray-500">
              No content provided for this layout.
            </div>
          )}
        </div>R
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
