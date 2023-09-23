import assert from "assert";
import { Database } from "../../src/database/db";
import { log } from "console";

describe("test get connection", () => {
  const db: Database = new Database(
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  process.env.DB_HOST!,
  process.env.DB_PORT!,
  process.env.DB_NAME!,
  process.env.DB_DIALECT!,
  );

  it("connect success", () => {
    db.connect();
    assert.notEqual(db.getConnection(), null);
  });
});
