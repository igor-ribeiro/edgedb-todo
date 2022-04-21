import createClient from "edgedb";

let client;

if (client == null) {
  client = createClient();
}

export { client };
