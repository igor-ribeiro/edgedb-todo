import { client } from "~/db";
import db from "~/db/edgeql-js";

export async function getUserById(id: string) {
  return db
    .select(db.User, (user) => ({
      id: true,
      name: true,
      filter: db.op(user.id, "=", db.uuid(id)),
      limit: 1,
    }))
    .assert_single()
    .run(client);
}
