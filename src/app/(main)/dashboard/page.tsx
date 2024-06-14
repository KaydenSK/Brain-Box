import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { use } from "react";
import { cookies } from "next/headers";
import db from "@/lib/supabase/db";
import { redirect } from "next/navigation";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";
import { getUserSubscriptionStatus } from "@/lib/supabase/queries";

const DashboardPage = async () => {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  const workSpace = await db.query.workspaces.findFirst({
    where: (fields, { eq }) => eq(fields.workspace_owner, user.id),
  });

  const { data: subscription, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  if (subscriptionError) return <div>Error retrieving subscription status</div>;

  if (!workSpace)
    return (
      <div className="bg-background h-screen w-screen flex justify-center items-center">
        <DashboardSetup
          subscription={subscription}
          user={user}
        ></DashboardSetup>
      </div>
    );

  redirect(`/dashboard/${workSpace.id}`);
};

export default DashboardPage;
