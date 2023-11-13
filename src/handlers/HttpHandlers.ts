import { INotificationService } from '@/contracts/usecases/INotificationService'
import { NotificationHandlers } from './NotificationHandlers'
import express, { Request, Response } from 'express'
import fileUpload from 'express-fileupload'
import { IAuthService } from '@/contracts/usecases/IAuthService'
import { AuthHandlers } from './AuthHandlers'
import { AuthJWT } from '../middleware/AuthJWT'
import { IJWTUtil } from '../contracts/utils/IJWTUtil'
import { EdgeServerHandlers } from './EdgeServerHandlers'
import { IEdgeServerService } from '@/contracts/usecases/IEdgeServerService'

export function runHttpHandlers(
    notificationService: INotificationService,
    authService: IAuthService,
    edgeServerService: IEdgeServerService,
    jwtUtil: IJWTUtil
) {

    //Instantiate express
    const app = express()
    app.use(express.urlencoded({extended: true}))
    app.use(express.json())
    const port = process.env.APP_PORT ??= '3000'

    app.use(express.json())
    app.use(fileUpload())

    //Instantiate Handlers
    const notifHandler = new NotificationHandlers(notificationService)
    const authHandler = new AuthHandlers(authService)
    const edgeServerHandler = new EdgeServerHandlers(edgeServerService)

    //Middlware
    const jwtMiddleware = new AuthJWT(process.env.JWT_SECRET_KEY!, jwtUtil)
    const jwtMiddlewareResetReq = new AuthJWT(process.env.RESET_TOKEN_SECRET_KEY!, jwtUtil)

    //Notification
    app.post('/notification', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => notifHandler.storeNotificationHandler(req, res))
    app.get('/notification', jwtMiddleware.authenticateToken , async (req: Request, res: Response) => notifHandler.fetchAllNotificationHandler(req, res))
    app.get('/notification/:id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => notifHandler.viewNotificationHandler(req, res))
    app.delete('/notification/:id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => notifHandler.deleteNotificationHandler(req, res))
    
    //Auth
    app.post('/login', async (req:Request, res: Response) => authHandler.loginHandler(req, res))
    app.post('/signup', async (req:Request, res: Response) => authHandler.signUpHandler(req, res))
    app.post('/verification', async (req:Request, res: Response) => authHandler.verificationHandler(req, res))
    app.post('/reset-password-request', async (req:Request, res: Response) => authHandler.resetPasswordReq(req, res))
    app.post('/reset-password', jwtMiddlewareResetReq.authenticateToken, async (req:Request, res: Response) => authHandler.resetPassword(req, res))
    
    //Edge Server
    app.post('/edge-server', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.addEdgeServer(req, res))
    app.post('/edge-device', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.addEdgeDevice(req, res))
    app.get('/edge-server', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.fetchEdgeServers(req, res))
    app.get('/edge-device/:edge_server_id', jwtMiddleware.authenticateToken, async (req: Request, res: Response) => edgeServerHandler.fetchEdgeDevices(req, res))

    //Listening 
    app.listen(port, () => {
        console.log(`app listening on port ${port}`)
    })
}
