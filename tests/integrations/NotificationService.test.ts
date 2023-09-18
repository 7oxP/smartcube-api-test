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

dotenv.config();

let notificationRepository: INotificationRepositories;
let cloudStorageService: IStorageService;
let cloudMessageService: ICloudMessagingService;
let notificationService: INotificationService;

beforeAll(async () => {
  notificationRepository = new NotificationRepository();
  cloudStorageService = new StorageService();
  cloudMessageService = new CloudMessagingService();
  notificationService = new NotificationService(
    notificationRepository,
    cloudMessageService,
    cloudStorageService
  );
});

const filePath = process.cwd() + "/tests/images/img1.png";
const buffer = fs.readFileSync(filePath);
const file: IUploadedFile = {
  buffer: buffer,
  originalname: "img1.png",
  mimetype: "image/png",
};

describe("store notification", () => {
  it("Store success", async () => {
    const authGuard = new AuthGuard(1, "", "", UserRoles.Admin);

    const res = await notificationService.storeNotification(
      authGuard,
      file,
      "wew1",
      "wew1 desc"
    );
    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  }, 10000);

  it("Store failed with user id invalid", async () => {
    const authGuard = new AuthGuard(0, "", "", UserRoles.Admin); //User with id 0 is invalid or not exists

    const res = await notificationService.storeNotification(
      authGuard,
      file,
      "wew1",
      "wew1 desc"
    );
    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.repoError);
  });
});

describe("view notification", () => {
  it("success", async () => {
    const authGuard = new AuthGuard(1, "", "", UserRoles.Admin);

    const res = await notificationService.viewNotification(authGuard, 2);
    console.log(res.getMessage());
    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  it("failed unauthorized", async () => {
    const authGuard = new AuthGuard(0, "", "", UserRoles.Admin);

    const res = await notificationService.viewNotification(authGuard, 2);
    console.log(res.getMessage());
    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess);
  });
});

describe("delete notification", () => {
  const authGuard = new AuthGuard(1, "", "", UserRoles.Admin);

  it("success", async () => {
    //create dummy data
    const storeRes = await notificationService.storeNotification(
      authGuard,
      file,
      "wew1",
      "wew1 desc"
    );

    //delete notif
    const res = await notificationService.deleteNotification(
      authGuard,
      storeRes.getData().id
    );
    console.log(res.getMessage());

    //assert
    assert.ok(res.getStatus());
    assert.equal(res.getStatusCode(), OperationStatus.success);
  });

  it("failed unauthorized", async () => {
    //create dummy data
    const storeRes = await notificationService.storeNotification(
      authGuard,
      file,
      "wew1",
      "wew1 desc"
    );

    //delete notif
    const authGuard2 = new AuthGuard(999999, "", "", UserRoles.Admin);
    const res = await notificationService.deleteNotification(
      authGuard2,
      storeRes.getData().id
    );
    // console.log(res.getMessage())

    //assert
    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.unauthorizedAccess);
  });

  it("failed model not found", async () => {
    //delete notif
    const res = await notificationService.deleteNotification(authGuard, 0);

    //assert
    assert.equal(res.getStatus(), false);
    assert.equal(res.getStatusCode(), OperationStatus.repoErrorModelNotFound);
  });
});
