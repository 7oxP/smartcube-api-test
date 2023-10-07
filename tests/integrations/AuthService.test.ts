import dotenv from "dotenv"
import assert from "assert"
import fs from "fs"

import { NotificationRepository } from "../../src/repositories/NotificationRepository"
import { INotificationRepositories } from "../../src/contracts/repositories/INotificationRepositories"
import { IAuthService } from "../../src/contracts/usecases/IAuthService"
import { NotificationService } from "../../src/usecases/notification/NotificationService"
import { INotificationService } from "../../src/contracts/usecases/INotificationService"
import { AuthService } from "../../src/usecases/auth/AuthService"
import { OperationStatus } from "../../src/constants/operations"
import { AuthGuard } from "../../src/middleware/AuthGuard"
import { UserRoles } from "../../src/contracts/middleware/AuthGuard"
import { Database } from "../../src/database/db"
import { JWTUtil } from "../../src/utils/JWTUtil"
import { IJWTUtil } from "../../src/contracts/utils/IJWTUtil"

dotenv.config()

let db: Database = new Database(
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  process.env.DB_HOST!,
  process.env.DB_PORT!,
  process.env.DB_NAME!,
  process.env.DB_DIALECT!
)

let notificationRepository: INotificationRepositories
let authService: IAuthService
let notificationService: INotificationService
let jwtUtil: IJWTUtil

beforeAll(async () => {
  //Connect db
  await db.connect()

  //create dummy user with id 1
  db.getConnection().query(
    "INSERT INTO users (id, username, email, password, created_at) VALUES (1000, 'iyan', 'iyan@mail.com', 'pass123', '2023-09-11')"
  )

  //Instantiate services
  authService = new AuthService()
  jwtUtil = new JWTUtil()
})

afterAll(async () => {
  await db.getConnection().query("DELETE FROM users WHERE id = 1000")
  db.getConnection().query("DELETE FROM users WHERE username = 'pras'")

})

describe("login", () => {
  it("failed to login due to wrong email", async () => {
    const email = "zoc@mail.com"
    const password = "pass123"

    const res = await authService.login(email, password)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelNotFound)
  })

  it("failed to login due to wrong password", async () => {
    const email = "iyan@mail.com"
    const password = "pass12345"

    const res = await authService.login(email, password)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelNotFound)
  })

  it("Login success", async () => {
    const email = "iyan@mail.com"
    const password = "pass123"

    const res = await authService.login(email, password)

    //assert
    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  })
})

describe("sign up", () => {
  it("failed to sign up due to email already exist", async () => {
    const username = 'iyan'
    const email = "iyan@mail.com"
    const password = "pass123"
    const cPassword = "pass123"

    const res = await authService.signUp(username, email, password, cPassword)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.repoError)
  })

  it("failed to sign up due to password and confirm password doesn't match", async () => {
    const username = 'iyan'
    const email = "iyan@mail.com"
    const password = "pass123"
    const cPassword = "pass1232"

    const res = await authService.signUp(username, email, password, cPassword)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.repoError)
  })

  it("sign up success", async () => {
    const username = 'pras'
    const email = "pras@mail.com"
    const password = "pass123"
    const cPassword = "pass123"

    const res = await authService.signUp(username, email, password, cPassword)
    console.log(res)

    //assert
    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  })
})
