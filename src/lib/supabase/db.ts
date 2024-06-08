import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../../migrations/schema";
import * as dotenv from "dotenv";
import { migrate } from "drizzle-orm/node-postgres/migrator";

dotenv.config({
  path: ".env",
});

if (!process.env.DATABASE_URL) {
  console.log("No database URL provided in .env file");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;

const client = postgres(connectionString as string, {});
const db = drizzle(client, { schema });

const migrateDb = async () => {
  try {
    console.log("Starting migration");
    await migrate(db, {
      migrationsFolder: "migrations",
    });
    console.log("Successfully migrated");
  } catch (error) {
    console.error("Error while migrating the database", error);
  }
};

migrateDb();

export default db;
