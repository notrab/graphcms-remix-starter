import { createCookieSessionStorage, redirect } from "remix";
import { compare, hash } from "bcrypt";

import { getSdk } from "~/generated/schema.server";
import { client } from "~/lib/graphcms.server";

const sessionSecret: string = process.env.SESSION_SECRET!;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "GCMS_session",
      secure: true,
      secrets: [sessionSecret],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  });

export const requireUserId = async (request: Request) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (!userId || typeof userId !== "string") throw redirect("/login");

  return userId;
};

export const getUserSession = (request: Request) =>
  getSession(request.headers.get("Cookie"));

export const getUserId = async (request: Request): Promise<string | null> => {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (!userId || typeof userId !== "string") return null;

  return userId;
};

export const getUser = async (request: Request) => {
  const userId = await getUserId(request);

  if (typeof userId !== "string") return null;

  const { GetAuthUserById } = await getSdk(client);

  try {
    const { user } = await GetAuthUserById({ id: userId });

    return user;
  } catch {
    throw logout(request);
  }
};

export const createUserSession = async ({
  userId,
  redirectTo,
}: {
  userId: string;
  redirectTo: string;
}) => {
  const session = await getSession();

  session.set("userId", userId);

  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

export const register = async ({
  name,
  email,
  password: rawPassword,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const { GetAuthUserByEmail, CreateAuthUser } = getSdk(client);

  const { user: userExists } = await GetAuthUserByEmail({
    email: email as string,
  });

  if (userExists) return null;

  const password = await hash(rawPassword, 10);

  const { user } = await CreateAuthUser({
    name,
    email,
    password,
  });

  if (!user) return null;

  return user;
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const { GetAuthUserByEmail } = getSdk(client);

  const { user } = await GetAuthUserByEmail({
    email,
  });

  if (!user) return null;

  const passwordMatches = await compare(password, user.password);

  if (!passwordMatches) return null;

  return user;
};

export const logout = async ({ headers }: Request) => {
  const session = await getSession(headers.get("Cookie"));

  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
};
