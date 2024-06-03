import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../migrations/schema";
import * as dotenv from "dotenv";
import { migrate } from "drizzle-orm/node-postgres/migrator";

dotenv.config({
  path: ".env",
});
if (!process.env.DATABASE_URL) {
  console.log("no db url");
}

const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString as string, {});
const db = drizzle(client, { schema });
const migreateDb = async () => {
  try {
    console.log("migrating client");
    await migrate(db, {
      migrationsFolder: "migrations",
    });
    console.log("Successfully migrated");
  } catch (error) {
    console.error("Error while migrating client", error);
  }
};

migreateDb();
export default db;
