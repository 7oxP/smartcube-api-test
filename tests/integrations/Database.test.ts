import { Database } from "../../src/database/db";
import dotenv from 'dotenv'
import assert from "assert";

dotenv.config()
console.log('wkwk', process.env)
describe("test get connection", () => {
  const db: Database = new Database(
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  process.env.DB_HOST!,
  process.env.DB_PORT!,
  process.env.DB_NAME!,
  process.env.DB_DIALECT!,
  );

  it("connect success", async () => {
    db.connect();
    assert.notEqual(db.getConnection(), null);
  });
});
