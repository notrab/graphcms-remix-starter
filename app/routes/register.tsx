import { useActionData, Form, Link } from "remix";
import type { ActionFunction, HeadersFunction, MetaFunction } from "remix";

import { createUserSession, register } from "~/lib/auth.server";

export const meta: MetaFunction = () => ({
  title: "Register",
});

export const headers: HeadersFunction = () => ({
  "Cache-Control": `public, max-age=${60 * 10}, s-maxage=${60 * 60 * 24 * 30}`,
});

type ActionData = {
  error?: string;
  fields?: {
    name: string;
    email: string;
    password: string;
  };
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  const formData: FormData = await request.formData();
  const { name, email, password } = Object.fromEntries(formData);

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return {
      error: "Form data is invalid",
    };
  }

  const fields = { name, email, password };

  const user = await register({
    name,
    email,
    password,
  });

  if (!user) {
    return {
      fields,
      error: "Unable to create an account. Please try again.",
    };
  }

  return createUserSession({ userId: user.id, redirectTo: "/" });
};

export default function RegisterRoute() {
  const actionData = useActionData<ActionData | undefined>();

  return (
    <div>
      <h1>Register</h1>

      <Form method="post">
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={actionData?.fields?.name}
          />
        </div>
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
          <button type="submit">Register</button>
        </div>

        <div>
          <p>
            Already got an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </Form>
    </div>
  );
}
