import dotenv from "dotenv";
import assert from "assert";
import fs from "fs";

import { NotificationRepository } from "../../src/repositories/NotificationRepository";
import { INotificationRepositories } from "../../src/contracts/repositories/INotificationRepositories";
import { IUserRepository } from '../../src/contracts/repositories/IUserRepository';
import { UserRepository } from '../../src/repositories/UserRepository';
import { CloudMessagingService } from "../../src/usecases/cloudMessage/CloudMessagingService";
import { ICloudMessagingService } from "../../src/contracts/usecases/ICloudMessagingService";
import { StorageService } from "../../src/usecases/storage/StorageService";
import { IStorageService } from "../../src/contracts/usecases/IStorageServices";
import { NotificationService } from "../../src/usecases/notification/NotificationService";
import { INotificationService } from "../../src/contracts/usecases/INotificationService";
import { IUploadedFile } from "../../src/contracts/IFile";
import { OperationStatus } from "../../src/constants/operations";
import { AuthGuard } from "../../src/middleware/AuthGuard";
import { UserRoles } from "../../src/contracts/middleware/AuthGuard";
import { Database } from "../../src/database/db";
import { IEmailService } from '../../src/contracts/usecases/IEmailService'
import { EmailService } from '../../src/usecases/email/EmailService'



dotenv.config();

let db: Database = new Database(
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  process.env.DB_HOST!,
  process.env.DB_PORT!,
  process.env.DB_NAME!,
  process.env.DB_DIALECT!,
)

let userRepository: IUserRepository
let notificationRepository: INotificationRepositories;
let cloudStorageService: IStorageService;
let cloudMessageService: ICloudMessagingService;
let notificationService: INotificationService;
let emailService: IEmailService

beforeAll(async () => {

  //Connect db
  await db.connect()

  // db.getConnection().query('DELETE FROM user_groups WHERE edge_server_id = 10003')
  // db.getConnection().query('DELETE FROM notifications WHERE user_id = 10003')
  // db.getConnection().query('DELETE FROM users WHERE id = 10003')
  // db.getConnection().query('DELETE FROM devices WHERE id = 10003')

  //create dummy data user, notification, devices, and user_groups with id 10003
  try {
    await db.getConnection().query("INSERT INTO users (id, username, email, password, created_at) VALUES (10003, 'iyan', 'iyan@mail.com', 'pass123', '2023-09-09')")
    await db.getConnection().query("INSERT INTO notifications (id, user_id, title, image, description, is_viewed, created_at, updated_at) VALUES " +
      `(10003,  10003, 'title 1', 'image 1', 'description 1', 0, '2023-09-09', '2023-09-09')`)
    await db.getConnection().query("INSERT INTO edge_servers (id, name, vendor, description, mqtt_user, mqtt_password, mqtt_pub_topic, mqtt_sub_topic) VALUES (10003, 'NUC 1001', 'INTEL', 'desc exmaple', 'user1', 'pass1', 'pub-topic-1', 'sub-topic-1')")
    await db.getConnection().query("INSERT INTO user_groups (user_id, edge_server_id, role_id) VALUES (10003, 10003, 1)")
  } catch (error) {
    throw error
  }

  //Instantiate services
  userRepository = new UserRepository()
  notificationRepository = new NotificationRepository();
  cloudStorageService = new StorageService();
  cloudMessageService = new CloudMessagingService();
  const emailService = new EmailService(
    process.env.SMTP_HOST!,
    Number(process.env.SMTP_PORT!),
    process.env.SMTP_USER!,
    process.env.SMTP_USER_PASSWORD!,
    process.env.SENDER_EMAIL!
  )
  notificationService = new NotificationService(
    userRepository,
    notificationRepository,
    cloudMessageService,
    cloudStorageService,
    emailService
  );
});

afterAll(async () => {
  await db.getConnection().query('DELETE FROM user_groups WHERE edge_server_id = 10003')
  await db.getConnection().query('DELETE FROM edge_servers WHERE id = 10003')
  await db.getConnection().query('DELETE FROM notifications WHERE user_id = 10003')
  await db.getConnection().query('DELETE FROM users WHERE id = 10003')
})


const filePath = process.cwd() + "/tests/images/img1.png";
const buffer = fs.readFileSync(filePath);
const file: IUploadedFile = {
  buffer: buffer,
  originalname: "img1.png",
  mimetype: "image/png",
};

let storedNotificationID = 0


describe("store", () => {

  it("Store failed with user id invalid", async () => {

    //create auth guard
    const authGuard = new AuthGuard(10003, "iyan2@mail.com", "iyan", UserRoles.Admin, 10003); //User with id 0 is invalid or not exists

    //execute usecase
    const resp = await notificationService.storeNotification(
      authGuard,
      file,
      "wew1",
      "wew1 desc"
    );

    // console.log(resp)

    //assert
    assert.equal(resp.getStatus(), false);
    assert.equal(OperationStatus.repoErrorModelNotFound, resp.getStatusCode());

  });

  it("Store success", async () => {

    //create auth guard
    const authGuard = new AuthGuard(10003, "iyan@mail.com", "iyan", UserRoles.Admin, 10003);

    //execute usecase
    const res = await notificationService.storeNotification(
      authGuard,
      file,
      "wew1",
      "wew1 desc"
    );

    // console.log(res)
    //assert
    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);

    storedNotificationID = res.getData().id

  });
});

describe("view notification", () => {

  it("success", async () => {
    const authGuard = new AuthGuard(10003, "", "", UserRoles.Admin, 10003);

    const res = await notificationService.viewNotification(authGuard, storedNotificationID);
    // console.log(res.getMessage());

    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  it("failed unauthorized", async () => {
    const authGuard = new AuthGuard(0, "", "", UserRoles.Admin, 10003);

    const res = await notificationService.viewNotification(authGuard, storedNotificationID);
    // console.log(res.getMessage());

    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess);
  });
});

describe("delete notification", () => {
  const authGuard = new AuthGuard(10003, "iyan@gmail.com", "iyan", UserRoles.Admin, 10003);

  it("failed unauthorized", async () => {
    //create dummy data
    // const storeRes = await notificationService.storeNotification(
    //   authGuard,
    //   file,
    //   "wew1",
    //   "wew1 desc"
    // );

    //delete notif
    const authGuard2 = new AuthGuard(999999, "", "", UserRoles.Admin, 10003);
    const res = await notificationService.deleteNotification(
      authGuard2,
      storedNotificationID
    );
    // console.log(res.getMessage())

    //assert
    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess);
  });

  it("success", async () => {
    //delete notif
    const res = await notificationService.deleteNotification(
      authGuard,
      storedNotificationID
    );
    // console.log(res);

    //assert
    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  it("failed model not found", async () => {
    //delete notif
    const res = await notificationService.deleteNotification(authGuard, 0);

    //assert
    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelNotFound);
  });
});
