import { Sequelize } from "sequelize"

export class Database {
    
    private user: string = ''
    private password: string = ''
    private host: string = ''
    private port: string = ''
    private dbName: string = ''
    private conn?: Sequelize

    constructor(user: string, password: string, host: string, port: string, dbName: string) {
        this.user = user
        this.password = password
        this.host = host
        this.port = port
        this.dbName = dbName
    }

    async connect(): Promise<void> {
        try {
            if (this.conn == null) {
                this.conn = new Sequelize(`mariadb://${this.user}:${this.password}@${this.host}:${this.port}/${this.dbName}`)
                await this.conn.authenticate();
            }
            console.log('Connection has been established successfully.')
        } catch (error) {
            throw new Error('Unable to connect to the database: ' + error)
        } 
    }

    getConnection(): Sequelize {
        return this.conn!
    }
}