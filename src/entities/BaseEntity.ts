import { Database } from "../database/db";

//Initialize DB Connection
const db: Database = new Database('root', '', 'localhost', '3306', 'smartcube')

//Connect
db.connect()

export { db }

