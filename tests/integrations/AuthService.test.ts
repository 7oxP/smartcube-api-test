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
import { IJWTUtil } from "../../src/contracts/utils/IJWTUtil"
import { JWTUtil } from "../../src/utils/JWTUtil"
import { IUserRepository } from "../../src/contracts/repositories/IUserRepository"
import { UserRepository } from "../../src/repositories/UserRepository"
import { IHashUtil } from "../../src/contracts/utils/IHashUtil"
import { HashUtil } from "../../src/utils/HashUtil"
import { ICloudMessagingService } from "../../src/contracts/usecases/ICloudMessagingService"
import { StorageService } from "../../src/usecases/storage/StorageService"
import { IStorageService } from "../../src/contracts/usecases/IStorageServices"
import { IEmailService } from "../../src/contracts/usecases/IEmailService"
import { EmailService } from "../../src/usecases/email/EmailService"

dotenv.config()

let db: Database = new Database(
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  process.env.DB_HOST!,
  process.env.DB_PORT!,
  process.env.DB_NAME!,
  process.env.DB_DIALECT!
)

let userRepo: IUserRepository
let authService: IAuthService
let notificationService: INotificationService
let jwtUtil: IJWTUtil
let hashUtil: IHashUtil
let notifRepo: INotificationRepositories
let cloudMessageService: ICloudMessagingService
let cloudStorageService: IStorageService
let emailService: IEmailService

beforeAll(async () => {
  //Instantiate services
  userRepo = new UserRepository()
  jwtUtil = new JWTUtil()
  hashUtil = new HashUtil()
  emailService = new EmailService(
    "smtp.gmail.com",
    587,
    "smartcubeppi@gmail.com",
    "ispt ujxo avvo hpoz",
    "smartcubeppi@gmail.com"
  )
  notificationService = new NotificationService(
    notifRepo,
    cloudMessageService,
    cloudStorageService,
    emailService
  )
  authService = new AuthService(
    userRepo,
    jwtUtil,
    hashUtil,
    notificationService
  )

  //Connect db
  await db.connect()

  //create dummy user with id 1
  db.getConnection().query(
    "INSERT INTO users (id, username, email, password, reset_token, is_verified, verification_code, created_at) VALUES (1000, 'iyan', 'iyan@mail.com', '$2b$10$hT.yOgwP5SA3OuEKHQY1W.qpe7U1DOxAI3LcLuOt.SwJ7Hjvfv4cO', 'token', 0, 'code', '2023-09-11')"
  )
})

afterAll(async () => {
  await db.getConnection().query("DELETE FROM users WHERE id = 1000")
  db.getConnection().query("DELETE FROM users WHERE username = 'pras'")
})

describe("login", () => {
  it("failed to login due to wrong email", async () => {
    const email = "wrong@mail.com"
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
    const username = "iyan"
    const email = "iyan@mail.com"
    const password = "pass123"
    const cPassword = "pass123"

    const res = await authService.signUp(username, email, password, cPassword)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.repoError)
  })

  it("failed to sign up due to password and confirm password doesn't match", async () => {
    const username = "iyan"
    const email = "iyan@mail.com"
    const password = "pass123"
    const cPassword = "pass1232"

    const res = await authService.signUp(username, email, password, cPassword)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.repoError)
  })

  it("sign up success", async () => {
    const username = "pras"
    const email = "pras@mail.com"
    const password = "pass123"
    const cPassword = "pass123"

    const res = await authService.signUp(username, email, password, cPassword)

    //assert
    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  })
})

describe("verification code", () => {
  it("verification code does match", async () => {
    const email = "iyan@mail.com"
    const verificationCode = "code"

    const res = await authService.checkVerificationCode(email, verificationCode)

    // assert
    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  })

  it("verification code does not match", async () => {
    const email = "iyan@mail.com"
    const verificationCode = "code"

    const res = await authService.checkVerificationCode(email, verificationCode)

    //assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelNotFound)
  })

  // it("verification code is expired", async () => {
  //   const email = "iyan@mail.com"
  //   const verificationCode = (await userRepo.findByEmail(email)).getData().getDataValue('verification_code')
  //   //  const updateCode =  db.getConnection().query(
  //   //     `UPDATE users SET verification_code = ${verificationCode} WHERE email = ${email}`
  //   //   )

  //   // console.log(updateCode)

  //   const res = await authService.checkVerificationCode(
  //     email,
  //     verificationCode
  //   )
  //   console.log("verifsfsd", verificationCode)
  //   console.log("respospos", res)
  //   console.log(res.getStatusCode(), OperationStatus.repoErrorModelNotFound)
  //   console.log(res.getStatus())
  //   //assert
  //   assert.equal(res.getStatus(), false)
  //   assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelNotFound)
  // })
})

describe("reset password request", () => {
  it("reset password request failed due to wrong email", async () => {
    const email = "wrong@mail.com"

    const res = await authService.resetPasswordRequest(email)

    // assert
    assert.equal(res.getStatus(), false)
    assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelNotFound)
  })

  it("reset password request successfully sent", async () => {
    const email = "iyan@mail.com"

    const res = await authService.resetPasswordRequest(email)

    // assert
    assert.equal(res.getStatus(), true)
    assert.equal(res.getStatusCode(), OperationStatus.success)
  })
})

