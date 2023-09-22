import { Sequelize } from "sequelize"

export class Database {

    private user: string = ''
    private password: string = ''
    private host: string = ''
    private port: string = ''
    private dbName: string = ''
    private dialect: string = ''
    private conn?: Sequelize

    constructor(user: string, password: string, host: string, port: string, dbName: string, dialect: string) {
        this.user = user
        this.password = password
        this.host = host
        this.port = port
        this.dbName = dbName
        this.dialect = dialect
    }

    connect(): void {
        try {
            if (process.env.APP_ENV == 'local') {
                this.conn = new Sequelize(`${this.dialect}://${this.user}:${this.password}@${this.host}:${this.port}/${this.dbName}`)
                this.conn.authenticate()
            } else {
                this.conn = new Sequelize(this.dbName, this.user, this.password, {
                    dialect: 'mysql',
                    host: this.host
                });
                this.conn.authenticate()
            }
        } catch (error) {
            throw new Error('Unable to connect to the database: ' + error)
        }
    }

    getConnection(): Sequelize {
        return this.conn!
    }
}
