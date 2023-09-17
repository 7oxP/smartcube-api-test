import assert from "assert";
import { Database } from "../../src/database/db";
import { log } from "console";

describe("test get connection", () => {
  const db: Database = new Database("root", "", "localhost", "3306", "mydb");

  it("connect success", () => {
    db.connect();
    assert.notEqual(db.getConnection(), null);
  });
});
