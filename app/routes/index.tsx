import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData, json, Link, Form } from "remix";

import { getUser } from "~/lib/auth.server";

type IndexData = {
  user: any;
};

export let loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  let data: IndexData = {
    user,
  };

  return json(data);
};

export let meta: MetaFunction = () => {
  return {
    title: "GraphCMS Remix Starter",
    description: "Welcome to remix!",
  };
};

export default function Index() {
  let data = useLoaderData<IndexData>();

  return (
    <div className="remix__page">
      {data.user ? (
        <div className="user-info">
          <span>{`Hi ${data.user.name}`}</span>

          <Form action="/logout" method="post">
            <button type="submit">Logout</button>
          </Form>
        </div>
      ) : (
        <>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </>
      )}
    </div>
  );
}
