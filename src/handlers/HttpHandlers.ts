import { INotificationService } from '@/contracts/usecases/INotificationService'
import { NotificationHandlers } from './NotificationHandlers'
import express, { Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import { AuthService } from '../usecases/auth/AuthService'
import { IAuthService } from '@/contracts/usecases/IAuthService'
import { AuthHandlers } from './AuthHandlers'
import { AuthJWT } from '../middleware/AuthJWT'
import { IJWTUtil } from '../contracts/utils/IJWTUtil'

export function runHttpHandlers(
    notificationService: INotificationService,
    authService: IAuthService,
    jwtUtil: IJWTUtil
) {

    //Instantiate express
    const app = express()
    app.use(express.urlencoded({extended: true}))
    app.use(express.json())
    const port = process.env.APP_PORT ??= '3000'

    app.use(express.json())
    app.use(fileUpload())

    //Instantiate Notification Service
    const notifHandler = new NotificationHandlers(notificationService)
    const authHandler = new AuthHandlers(authService)
    const jwtMiddleware = new AuthJWT(process.env.JWT_SECRET_KEY!, jwtUtil)
    const jwtMiddlewareResetReq = new AuthJWT(process.env.RESET_TOKEN_SECRET_KEY!, jwtUtil)

    app.post('/notification', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => notifHandler.storeNotificationHandler(req, res))
    app.get('/notification', jwtMiddleware.authenticateToken , async (req: Request, res: Response) => notifHandler.fetchAllNotificationHandler(req, res))
    app.get('/notification/:id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => notifHandler.viewNotificationHandler(req, res))
    app.delete('/notification/:id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => notifHandler.deleteNotificationHandler(req, res))
    app.post('/login', async (req:Request, res: Response) => authHandler.loginHandler(req, res))
    app.post('/signup', async (req:Request, res: Response) => authHandler.signUpHandler(req, res))
    app.post('/verification', async (req:Request, res: Response) => authHandler.verificationHandler(req, res))
    app.post('/reset-password-request', async (req:Request, res: Response) => authHandler.resetPasswordReq(req, res))
    app.post('/reset-password', jwtMiddlewareResetReq.authenticateToken, async (req:Request, res: Response) => authHandler.resetPassword(req, res))

    //Listening 
    app.listen(port, () => {
        console.log(`app listening on port ${port}`)
    })
}
