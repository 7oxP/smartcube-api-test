import dotenv from "dotenv";
import assert from "assert";
import fs from "fs";

import { NotificationRepository } from "../../src/repositories/NotificationRepository";
import { INotificationRepositories } from "../../src/contracts/repositories/INotificationRepositories";
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

dotenv.config();

let db: Database = new Database(
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  process.env.DB_HOST!,
  process.env.DB_PORT!,
  process.env.DB_NAME!,
  process.env.DB_DIALECT!,
)

let notificationRepository: INotificationRepositories;
let cloudStorageService: IStorageService;
let cloudMessageService: ICloudMessagingService;
let notificationService: INotificationService;




beforeAll(async () => {

  //Connect db
  await db.connect()

  //create dummy user with id 1
  db.getConnection().query('DELETE FROM notifications')
  db.getConnection().query('DELETE FROM users WHERE id = 1000')

  db.getConnection().query("INSERT INTO users (id, username, email, password) VALUES (1000, 'iyan', 'iyan@mail.com', 'pass123')")
  db.getConnection().query("INSERT INTO notifications (id, user_id, title, image, description, is_viewed, created_at, updated_at) VALUES " +
    `(1000,  1000, 'title 1', 'image 1', 'description 1', 0, '2023-09-09', '2023-09-09')`)

  //Instantiate services
  notificationRepository = new NotificationRepository();
  cloudStorageService = new StorageService();
  cloudMessageService = new CloudMessagingService();
  notificationService = new NotificationService(
    notificationRepository,
    cloudMessageService,
    cloudStorageService
  );
});

afterAll(() => {
  db.getConnection().query('DELETE FROM notifications')
  db.getConnection().query('DELETE FROM users WHERE id = 1000')
})


const filePath = process.cwd() + "/tests/images/img1.png";
const buffer = fs.readFileSync(filePath);
const file: IUploadedFile = {
  buffer: buffer,
  originalname: "img1.png",
  mimetype: "image/png",
};

let storedNotificationID = 0


describe("store notifs", () => {

  it("Store failed with user id invalid", async () => {

    //create auth guard
    const authGuard = new AuthGuard(0, "", "", UserRoles.Admin); //User with id 0 is invalid or not exists

    //execute usecase
    const resp = await notificationService.storeNotification(
      authGuard,
      file,
      "wew1",
      "wew1 desc"
    );

    //assert
    assert.equal(resp.getStatus(), false);
    assert.equal(resp.getStatusCode(), OperationStatus.repoError);

  });

  it("Store success", async () => {

    //create auth guard
    const authGuard = new AuthGuard(1000, "iyan@mail.com", "iyan", UserRoles.Admin);

    //execute usecase
    const res = await notificationService.storeNotification(
      authGuard,
      file,
      "wew1",
      "wew1 desc"
    );

    //assert
    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);

    storedNotificationID = res.getData().id
  });
});

describe("view notification", () => {

  it("success", async () => {
    const authGuard = new AuthGuard(1000, "", "", UserRoles.Admin);

    const res = await notificationService.viewNotification(authGuard, storedNotificationID);
    // console.log(res.getMessage());

    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  it("failed unauthorized", async () => {
    const authGuard = new AuthGuard(0, "", "", UserRoles.Admin);

    const res = await notificationService.viewNotification(authGuard, storedNotificationID);
    // console.log(res.getMessage());

    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess);
  });
});

describe("delete notification", () => {
  const authGuard = new AuthGuard(1000, "", "", UserRoles.Admin);

  it("failed unauthorized", async () => {
    //create dummy data
    // const storeRes = await notificationService.storeNotification(
    //   authGuard,
    //   file,
    //   "wew1",
    //   "wew1 desc"
    // );

    //delete notif
    const authGuard2 = new AuthGuard(999999, "", "", UserRoles.Admin);
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
    //create dummy data
    // const storeRes = await notificationService.storeNotification(
    //   authGuard,
    //   file,
    //   "wew1",
    //   "wew1 desc"
    // );

    //delete notif
    const res = await notificationService.deleteNotification(
      authGuard,
      storedNotificationID
    );
    console.log(res.getMessage());

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
