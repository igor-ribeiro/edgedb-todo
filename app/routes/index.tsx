import {
  Form,
  useFetcher,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { client } from "~/db";
import db from "~/db/edgeql-js";
import { useEffect, useRef } from "react";
import { requireUserId } from "~/server";

type Task = {
  id: string;
  title: string;
  done: boolean;
};

type User = {
  id: string;
  name: string;
};

type LoaderData = {
  tasks: Task[];
  user: User;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const [tasks, user] = await Promise.all([
    db
      .select(db.Task, (task) => ({
        // this is how you select all fields
        ...db.Task["*"],
        filter: db.op(task.user.id, "=", db.uuid(userId)),
        order_by: task.id,
      }))
      .run(client),

    db
      .select(db.User, (user) => ({
        ...db.User["*"],
        filter: db.op(user.id, "=", db.uuid(userId)),
      }))
      .assert_single()
      .run(client),
  ]);

  return json<LoaderData>({
    tasks,
    user,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const userId = await requireUserId(request);

  const action = data.get("_action");

  if (action === "create") {
    const user = db
      .select(db.User, (user) => ({
        filter: db.op(user.id, "=", db.uuid(userId)),
      }))
      .assert_single();

    const query = db.insert(db.Task, {
      title: data.get("title") as string,
      user,
    });

    await query.run(client);
  }

  if (action === "update") {
    const id = data.get("id");
    const done = data.get("done");

    const query = db.update(db.Task, (task) => ({
      set: {
        done: done === "on",
      },
      filter: db.op(task.id, "=", db.uuid(id as string)),
    }));

    await query.run(client);
  }

  if (action === "delete") {
    const id = data.get("id");

    const query = db.delete(db.Task, (task) => ({
      filter: db.op(task.id, "=", db.uuid(id as string)),
    }));

    await query.run(client);
  }

  return json({});
};

export default function Index() {
  const { tasks, user } = useLoaderData<LoaderData>();
  const { state, submission } = useTransition();
  const inputRef = useRef<HTMLInputElement>();

  const isAdding =
    state === "submitting" && submission.formData.get("_action") === "create";

  useEffect(() => {
    if (!isAdding) {
      inputRef.current.value = "";
    }
  }, [isAdding]);

  return (
    <div>
      <h1>Tasks for {user.name}</h1>
      <ul>
        {tasks
          .filter((task) => !task.done)
          .map((task) => (
            <Task task={task} key={task.id} />
          ))}
      </ul>

      <Form method="post" replace>
        <input type="hidden" name="_action" value="create" />
        <input
          type="text"
          name="title"
          placeholder="Create Task"
          ref={inputRef}
          autoFocus
        />
      </Form>

      <h2>Done</h2>
      <ul>
        {tasks
          .filter((task) => task.done)
          .map((task) => (
            <Task task={task} key={task.id} />
          ))}
      </ul>
    </div>
  );
}

function Task({ task }: { task: Task }) {
  const fetcher = useFetcher();
  const formRef = useRef();

  return (
    <li
      style={{
        opacity: fetcher.state === "loading" ? 0.5 : 1,
      }}
    >
      <fetcher.Form
        method="post"
        replace
        ref={formRef}
        style={{
          display: "inline",
        }}
      >
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="_action" value="update" />

        <input
          type="checkbox"
          name="done"
          onChange={() => fetcher.submit(formRef.current)}
          checked={task.done}
        />
      </fetcher.Form>

      {task.title}

      <fetcher.Form
        method="post"
        replace
        style={{
          display: "inline",
        }}
      >
        <input type="hidden" name="id" value={task.id} />

        <button
          type="submit"
          name="_action"
          value="delete"
          style={{
            margin: "0 6px",
          }}
        >
          &times;
        </button>
      </fetcher.Form>
    </li>
  );
}
