import dotenv from 'dotenv'

import { NotificationRepository } from './repositories/NotificationRepository'
import { StorageService } from './usecases/storage/StorageService'
import { CloudMessagingService } from './usecases/cloudMessage/CloudMessagingService'
import { NotificationService } from './usecases/notification/NotificationService'
import { runHttpHandlers } from './handlers/HttpHandlers'
import { UserRepository } from './repositories/UserRepository'

function main() {

    const userRepository = new UserRepository()
    const notificationRepository = new NotificationRepository()
    const cloudStorageService = new StorageService()
    const cloudMessageService = new CloudMessagingService()
    const notificationService = new NotificationService(
        userRepository, 
        notificationRepository, 
        cloudMessageService, 
        cloudStorageService
    )

    runHttpHandlers(notificationService)
}

main()
