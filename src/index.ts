import { NotificationRepository } from "./repositories/NotificationRepository"
import { NotificationService } from "./usecases/notification/NotificationService"
import { File } from "buffer"

let notifRepo = new NotificationRepository()
let notifService = new NotificationService(notifRepo)

// You now have a File object named 'file' with the name 'dummy.txt' and the content 'Hello, World!'.

// console.log()
