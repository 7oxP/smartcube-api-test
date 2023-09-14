import assert from 'assert'
import { Database } from '../src/database/db'
import { log } from 'console'

describe("test get connection", () => {

    const db: Database = new Database('root', '', 'localhost', '3306', 'smartcube')

    it("connect success", async () => {

        await db.connect()
        assert.notEqual(db.getConnection(), null)
    })
    
})