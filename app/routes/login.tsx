import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { client } from "~/db";
import db from "~/db/edgeql-js";
import { createUserSession, getUserId } from "~/server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);

  console.log({ userId });

  if (userId) {
    return redirect("/");
  }

  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const name = data.get("name") as string;

  if (!name) {
    throw new Error("name is required");
  }

  const result = await db
    .insert(db.User, {
      name,
    })
    .run(client);

  return await createUserSession(request, result.id);
};

export default function Login() {
  return (
    <div>
      <h1>Login</h1>

      <Form replace method="post">
        <label>
          <p>Name</p>
          <input type="text" name="name" />
        </label>
      </Form>
    </div>
  );
}
