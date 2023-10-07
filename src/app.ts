import dotenv from 'dotenv'

import { NotificationRepository } from './repositories/NotificationRepository'
import { StorageService } from './usecases/storage/StorageService'
import { CloudMessagingService } from './usecases/cloudMessage/CloudMessagingService'
import { NotificationService } from './usecases/notification/NotificationService'
import { runHttpHandlers } from './handlers/HttpHandlers'
import { AuthService } from './usecases/auth/AuthService'
import { JWTUtil } from './utils/JWTUtil'

function main() {

    const notificationRepository = new NotificationRepository()
    const cloudStorageService = new StorageService()
    const cloudMessageService = new CloudMessagingService()
    const notificationService = new NotificationService(notificationRepository, cloudMessageService, cloudStorageService)
    const authService = new AuthService()
    const jwtUtil = new JWTUtil()

    runHttpHandlers(notificationService, authService, jwtUtil)

}

main()
