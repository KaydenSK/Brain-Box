"use client";
import { Subscription, workspace } from "@/lib/supabase/supabase.types";
import { AuthUser } from "@supabase/supabase-js";
import React, { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import EmojiPicker from "../global/emoji-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { createWorkspace } from '@/lib/supabase/queries';
import { CreateWorkspaceFormSchema } from "../../lib/types";
import z from "zod";
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/providers/state-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface DashboardSetupProps {
  user: AuthUser;
  subscription: Subscription | null;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
  subscription,
  user,
}) => {

  const { toast } = useToast();
  const router = useRouter();
  const { dispatch } = useAppState();
  const [selectedEmoji, setSelectedEmoji] = useState('💼');
  const supabase = createClientComponentClient();

  const {register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },} = useForm<z.infer<typeof CreateWorkspaceFormSchema>> ({
    mode: 'onChange',
    defaultValues:{
    logo: '',
    workspaceName: '',
    }
    });

    const onSubmit: SubmitHandler<
    z.infer<typeof CreateWorkspaceFormSchema>
  > = async (value) => {
    const file = value.logo?.[0];
    let filePath = null;
    const workspaceUUID = v4();
    console.log(file);

    if (file) {
      try {
        const { data, error } = await supabase.storage
          .from('workspace-logos')
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            cacheControl: '3600',
            upsert: true,
          });
        if (error) throw new Error('');
        filePath = data.path;
      } catch (error) {
        console.log('Error', error);
        toast({
          variant: 'destructive',
          title: 'Error! Could not upload your workspace logo',
        });
      }
    }
    try {
      const newWorkspace: workspace = {
        data: null,
        created_at: new Date().toISOString(),
        icon_id: selectedEmoji,
        id: workspaceUUID,
        in_trash: '',
        title: value.workspaceName,
        workspace_owner: user.id,
        logo: filePath || null,
        banner_url: '',
      };
      const { data, error: createError } = await createWorkspace(newWorkspace);
      if (createError) {
        throw new Error();
      }
      dispatch({
        type: 'ADD_WORKSPACE',
        payload: { ...newWorkspace, folders: [] },
      });

      toast({
        title: 'Workspace Created',
        description: `${newWorkspace.title} has been created successfully.`,
      });

      router.replace(`/dashboard/${newWorkspace.id}`);
    } catch (error) {
      console.log(error, 'Error');
      toast({
        variant: 'destructive',
        title: 'Could not create your workspace',
        description:
          "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
      });
    } finally {
      reset();
    }
  };

  return (
    <Card className="w-[800px] h-screen sm:h-auto ">
      <CardHeader>
        <CardTitle>Create A Workspace</CardTitle>
        <CardDescription>
          Lets create a private workspace to get you started.You can add
          collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <form onSubmit={() => {}}>
        <div className="flex flex-col gap-4">
          <div
            className="flex
            items-center
            gap-4"
          >
            <div className="text-5xl">
              <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                {selectedEmoji}
              </EmojiPicker>
            </div>

            <div className="w-full">
              <Label
                htmlFor="workspaceName"
                className="text-sm text-muted-foreground"
              >
                Name
              </Label>
              <Input
              id="workspaceName"
              type="text"
              placeholder="Workspace Name"
              disabled={isLoading}
              {...register('workspaceName', {
                required: 'Workspace name is required',
              })}/>
                  <small className="text-red-600">
                  {errors?.workspaceName?.message?.toString()}
                </small>
            </div>
          </div>

          <div>
          <Label
                htmlFor="logo"
                className="text-sm
                  text-muted-foreground
                "
              >
                Workspace Logo
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                placeholder="Workspace Name"
                disabled={isLoading || subscription?.status !== 'active'}
                {...register('logo', {
                  required: false,
                })}
              />
              <small className="text-red-600">
                {errors?.logo?.message?.toString()}
              </small>
          </div>
        </div>
      </form>

      <CardContent></CardContent>
    </Card>
  );
};

export default DashboardSetup;