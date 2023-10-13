import dotenv from 'dotenv'

import { NotificationRepository } from './repositories/NotificationRepository'
import { StorageService } from './usecases/storage/StorageService'
import { CloudMessagingService } from './usecases/cloudMessage/CloudMessagingService'
import { NotificationService } from './usecases/notification/NotificationService'
import { runHttpHandlers } from './handlers/HttpHandlers'
import { AuthService } from './usecases/auth/AuthService'
import { JWTUtil } from './utils/JWTUtil'
import { UserRepository } from './repositories/UserRepository'
import { HashUtil } from './utils/HashUtil'
import { EmailService } from './usecases/email/EmailService'
import { AuthJWT } from './middleware/AuthJWT'

function main() {

    const userRepository = new UserRepository()
    const notificationRepository = new NotificationRepository()
    const cloudStorageService = new StorageService()
    const cloudMessageService = new CloudMessagingService()
    const emailService = new EmailService('smtp.gmail.com',587,'smartcubeppi@gmail.com','ispt ujxo avvo hpoz','smartcubeppi@gmail.com')
    const notificationService = new NotificationService(userRepository, notificationRepository, cloudMessageService, cloudStorageService, emailService)
    const jwtUtil = new JWTUtil()
    const hashUtil = new HashUtil()
    const authService = new AuthService(userRepository, jwtUtil, hashUtil, notificationService)


    runHttpHandlers(notificationService, authService, jwtUtil)

}

main()
