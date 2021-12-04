import { useActionData, Form, Link } from "remix";
import type { ActionFunction, HeadersFunction, MetaFunction } from "remix";

import { createUserSession, login } from "~/lib/auth.server";

export const meta: MetaFunction = () => ({
  title: "Login",
});

export const headers: HeadersFunction = () => ({
  "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24 * 30}`,
});

type ActionData = {
  error?: string;
  fields?: {
    email: string;
    password: string;
  };
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const formData: FormData = await request.formData();
  const { email, password } = Object.fromEntries(formData);

  if (typeof email !== "string" || typeof password !== "string") {
    return {
      error: "Form data is invalid",
    };
  }

  const fields = { email, password };

  const user = await login({
    email,
    password,
  });

  if (!user) {
    return {
      fields,
      error: "Wrong username/password combination",
    };
  }

  return createUserSession({ userId: user.id, redirectTo: "/" });
};

export default function LoginRoute() {
  const actionData = useActionData<ActionData | undefined>();

  return (
    <div>
      <h1>Login</h1>

      <Form method="post">
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={actionData?.fields?.email}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            defaultValue={actionData?.fields?.password}
          />
        </div>
        {actionData?.error && (
          <div>
            <p role="alert">{actionData.error}</p>
          </div>
        )}

        <div>
          <button type="submit">Login</button>
        </div>

        <div>
          <p>
            Not got an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </Form>
    </div>
  );
}
