"use server";
import { eq, sql, and, ilike, notExists } from "drizzle-orm";
import { validate } from "uuid";
import { files, folders, users, workspaces } from "../../../migrations/schema";
import db from "./db";
import { collaborators } from "./schema";
import { Folder, Subscription, User, workspace } from "./supabase.types";

export const createWorkspace = async (workspace: workspace) => {
  try {
    const response = await db.insert(workspaces).values(workspace);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};

export const getUserSubscriptionStatus = async (userId: string) => {
  try {
    const data = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
    });
    if (data) return { data: data as Subscription, error: null };
    else return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: `Error` };
  }
};

export const getFiles = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: "Error" };
  try {
    const results = (await db
      .select()
      .from(files)
      .orderBy(files.created_at)
      .where(eq(files.folder_id, folderId))) as File[] | [];
    return { data: results, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};


export const getFolders = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid)
    return {
      data: null,
      error: 'Error',
    };

  try {
    const results: Folder[] | [] = await db
      .select()
      .from(folders)
      .orderBy(folders.created_at)
      .where(eq(folders.workspace_id, workspaceId));
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: 'Error' };
  }
};

export const getPrivateWorkspaces = async(userId: string) => {
  if (!userId) return [];
  const privateWorkspaces = (await db
    .select({
      id: workspaces.id,
      created_at: workspaces.created_at,
      workspace_owner: workspaces.workspace_owner,
      title: workspaces.title,
      icon_id: workspaces.icon_id,
      data: workspaces.data,
      in_trash: workspaces.in_trash,
      logo: workspaces.logo,
      banner_url: workspaces.banner_url,
    })
    .from(workspaces)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.workspaceId, workspaces.id))
        ),
        eq(workspaces.workspace_owner, userId)
      )
    )) as {
      id: string;
      created_at: any;
      workspace_owner: string;
      title: string;
      icon_id: string;
      data: string | null;
      in_trash: string | null;
      logo: string | null;
      banner_url: string | null;
    }[];
  return privateWorkspaces;
};

export const getCollaboratingWorkspaces = async (userId: string) => {
  if (!userId) return [];
  const collaboratedWorkspaces = (await db
    .select({
      id: workspaces.id,
      created_at: workspaces.created_at,
      workspace_owner: workspaces.workspace_owner,
      title: workspaces.title,
      icon_id: workspaces.icon_id,
      data: workspaces.data,
      in_trash: workspaces.in_trash,
      logo: workspaces.logo,
      banner_url: workspaces.banner_url,
    })
    .from(users)
    .innerJoin(collaborators, eq(users.id, collaborators.userId))
    .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
    .where(eq(users.id, userId))) as {
      id: string;
      created_at: any;
      workspace_owner: string;
      title: string;
      icon_id: string;
      data: string | null;
      in_trash: string | null;
      logo: string | null;
      banner_url: string | null;
    }[];
  return collaboratedWorkspaces;
};


export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return [];
  const sharedWorkspaces = (await db
    .selectDistinct({
      id: workspaces.id,
      created_at: workspaces.created_at,
      workspace_owner: workspaces.workspace_owner,
      title: workspaces.title,
      icon_id: workspaces.icon_id,
      data: workspaces.data,
      in_trash: workspaces.in_trash,
      logo: workspaces.logo,
      banner_url: workspaces.banner_url,
    })
    .from(workspaces)
    .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
    .where(
      sql`${collaborators.userId} = ${userId} AND ${workspaces.workspace_owner} != ${userId}`
    )
    .orderBy(workspaces.created_at)) as {
      id: string;
      created_at: any;
      workspace_owner: string;
      title: string;
      icon_id: string;
      data: string | null;
      in_trash: string | null;
      logo: string | null;
      banner_url: string | null;
    }[];
  return sharedWorkspaces;
};


export const addCollaborators = async (users: User[], workspaceId: string) => {
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
    });
    if (!userExists)
      await db.insert(collaborators).values({ workspaceId, userId: user.id });
  });
};

export const getUsersFromSearch = async (email: string) => {
  if (!email) return [];
  const accounts = db
    .select()
    .from(users)
    .where(ilike(users.email, `${email}%`));
  return accounts;
};