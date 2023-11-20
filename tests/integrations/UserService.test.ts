import dotenv from "dotenv"
import assert from "assert"

import { IUserService } from "../../src/contracts/usecases/IUserService"
import { UserService } from "../../src/usecases/user/UserService"
import { IUserRepository } from "../../src/contracts/repositories/IUserRepository"
import { UserRepository } from "../../src/repositories/UserRepository"
import { OperationStatus } from "../../src/constants/operations"
import { AuthGuard } from "../../src/middleware/AuthGuard"
import { UserRoles } from "../../src/contracts/middleware/AuthGuard"
import { Database } from "../../src/database/db"

dotenv.config()

let db: Database = new Database(
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    process.env.DB_HOST!,
    process.env.DB_PORT!,
    process.env.DB_NAME!,
    process.env.DB_DIALECT!
)

let userService: IUserService
let userRepository: IUserRepository

beforeAll(async () => {
    //Connect db
    await db.connect()
    //create dummy data user, notification, devices, and user_groups with id 10003
    try {
        await db
            .getConnection()
            .query(
                "INSERT INTO users (id, username, email, password, created_at) VALUES (10003, 'iyan', 'iyan@mail.com', 'pass123', '2023-09-09')"
            )
    } catch (error) {
        throw error
    }

    //Instantiate services
    userRepository = new UserRepository()
    userService = new UserService(userRepository)
})

afterAll(async () => {
    await db.getConnection().query("DELETE FROM users WHERE id = 10003")
})

describe("get user profile", () => {
    it("failed unauthorized", async () => {
        const authGuard = new AuthGuard(0, "", "", UserRoles.Admin, 10003)

        const res = await userService.getUserProfile(authGuard)

        assert.equal(res.getStatus(), false)
        assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess)
    })

    it("successfully get user profile", async () => {
        const authGuard = new AuthGuard(
            10003,
            "iyan@mail.com",
            "iyan",
            UserRoles.Admin,
            10003
        )

        const res = await userService.getUserProfile(authGuard)

        assert.ok(res.getStatus())
        assert.equal(res.getStatusCode(), OperationStatus.success)
    })

    
})

