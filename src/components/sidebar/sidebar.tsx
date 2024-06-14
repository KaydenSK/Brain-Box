import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import React from "react";
import { cookies } from 'next/headers';
import { getUserSubscriptionStatus,   getFolders, getPrivateWorkspaces, getCollaboratingWorkspaces, getSharedWorkspaces } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";
import { twMerge } from "tailwind-merge";
import WorkspaceDropdown from "./workspace-dropdown";


interface SidebarProps {
    params: { workspaceId: string };
    className?: string;
  }

const Sidebar: React.FC<SidebarProps> = async ({ params, className }) => {

  const supabase = createServerComponentClient({ cookies });

  //users

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: subscriptionData, error: subscriptionError } =
  await getUserSubscriptionStatus(user.id);

  const { data: workspaceFolderData, error: foldersError } = await getFolders(
    params.workspaceId
  );
  //error
  if (subscriptionError || foldersError) redirect('/dashboard');

  const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
  await Promise.all([
    getPrivateWorkspaces(user.id),
    getCollaboratingWorkspaces(user.id),
    getSharedWorkspaces(user.id),
  ]);

  return <aside className={twMerge("hidden sm:flex sm:flex-1 !w-[250px] shrink-0 p-4 md:gap-4 !justify-between", className )} >
    <div>
    <WorkspaceDropdown 
          privateWorkspaces={privateWorkspaces}
          sharedWorkspaces={sharedWorkspaces}
          collaboratingWorkspaces={collaboratingWorkspaces}
          defaultValue={[
            ...privateWorkspaces,
            ...collaboratingWorkspaces,
            ...sharedWorkspaces,
          ].find((workspace) => workspace.id === params.workspaceId)}
        />
    </div>
    </aside>;
};

export default Sidebar;
