import dotenv from "dotenv";
import assert from "assert";
import { Database } from "../../src/database/db";
import { IEdgeServerRepository } from "../../src/contracts/repositories/IEdgeServerRepository"
import { IEdgeServerService } from "../../src/contracts/usecases/IEdgeServerService"
import { EdgeServerRepository } from "../../src/repositories/EdgeServerRepository"
import { EdgeServerService } from "../../src/usecases/edgeServer/EdgeServerService"
import { IJWTUtil } from "../../src/contracts/utils/IJWTUtil";
import { JWTUtil } from "../../src/utils/JWTUtil";
import { AuthGuard } from "../../src/middleware/AuthGuard";
import { UserRoles } from "../../src/contracts/middleware/AuthGuard";
import { OperationStatus } from "../../src/constants/operations";
import { mockMQTTService } from "../../src/usecases/mqtt/__mocks__/MQTTService"
import { Response } from "../../src/utils/Response";

dotenv.config();

let db: Database = new Database(
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    process.env.DB_HOST!,
    process.env.DB_PORT!,
    process.env.DB_NAME!,
    process.env.DB_DIALECT!,
)

let edgeServerRepo: IEdgeServerRepository
let edgeServerService: IEdgeServerService
let jwtUtil: IJWTUtil

beforeAll(async () => {

    mockMQTTService.publish.mockClear()
    mockMQTTService.subscribe.mockClear()
    mockMQTTService.connect.mockClear()

    jwtUtil = new JWTUtil()
    edgeServerRepo = new EdgeServerRepository()    
    edgeServerService = new EdgeServerService(jwtUtil, edgeServerRepo, mockMQTTService)

    await db.connect()

    //create dummy user with id 10002
    await db.getConnection().query(
        "INSERT INTO users (id, username, email, password, reset_token, is_verified, verification_code, created_at) VALUES (10002, 'iyan', 'iyan@mail.com', '$2b$10$hT.yOgwP5SA3OuEKHQY1W.qpe7U1DOxAI3LcLuOt.SwJ7Hjvfv4cO', 'resettoken123', 0, '123456', '2023-09-11')"
    )
})

afterAll(async () => {
    await db.getConnection().query("DELETE FROM user_groups WHERE user_id = 10002")
    await db.getConnection().query("DELETE FROM edge_servers WHERE name = 'server 1'")
    await db.getConnection().query("DELETE FROM users WHERE id = 10002")
    await db.getConnection().query("DELETE FROM devices")
})

describe("addEdgeServer", () => {

    //create auth guard
    const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

    it("success", async () => {
        const res = await edgeServerService.addEdgeServer(
            authGuard,
            "server 1",
            "intel",
            "desc 1"
        )

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)

    })
})

describe("fetch edge", () => {

    it("user does have edge", async () => {
        //create auth guard
        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.fetchEdgeServer(authGuard)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData().length, 1)

    })

    it("user doesn't have edge", async () => {

        //create auth guard
        const authGuard = new AuthGuard(10001, "iyan@mai.com", "iyan", UserRoles.Admin);

        const res = await edgeServerService.fetchEdgeServer(authGuard)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData().length, 0)

    })

})

describe("add device", () => {

    it("success", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.addDevice(
            authGuard,
            edgeRes.getData()[0].id,
            "vendor 1",
            "123",
            "camera",
            "rtsp",
            "",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )   

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)

    })

    it("failed due to invalid device type", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.addDevice(
            authGuard,
            edgeRes.getData()[0].id,
            "vendor 1",
            "123",
            "motorcycle",
            "rtsp",
            "",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )   

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.addDeviceError)
    })

    it("failed due to invalid device source type", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);
        
        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.addDevice(
            authGuard,
            edgeRes.getData()[0].id,
            "vendor 1",
            "123",
            "camera",
            "mqtt",
            "",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )   

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.addDeviceError)

    })
})

describe("fetch devices", () => {

    it("devices found", async () => {
        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData().devices.length, 1)
    })

    it("devices config found", async () => {

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const authGuard2 = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin, edgeRes.getData()[0].id);

        const res = await edgeServerService.fetchDevicesConfig(authGuard2)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData().length, 1)
    })

    it("devices not found", async () => {
        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        // const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const res = await edgeServerService.fetchDevices(authGuard, 10)

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)
        assert.equal(res.getData(), null)
    })

})

describe("update device", () => {

    it("success", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const fetchRes = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)
        // console.log(fetchRes)

        const res = await edgeServerService.updateDeviceConfig(
            authGuard,
            edgeRes.getData()[0].id,
            fetchRes.getData().devices[0].id,
            "vendor 1000",
            "PDIP-2034",
            "camera",
            "rtsp",
            "",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )   

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.success)

    })

    it("failed due to invalid device type", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const fetchRes = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)

        const res = await edgeServerService.updateDeviceConfig(
            authGuard,
            edgeRes.getData()[0].id,
            fetchRes.getData().id,
            "vendor 1000",
            "PDIP-2034",
            "motorcycle",
            "rtsp",
            "",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )   

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.updateDeviceError)
    })

    it("failed due to invalid device source type", async () => {

        mockMQTTService.publish.mockReturnValue(new Response().setStatus(true))

        const authGuard = new AuthGuard(10002, "iyan@mai.com", "iyan", UserRoles.Admin);

        const edgeRes = await edgeServerService.fetchEdgeServer(authGuard)

        const fetchRes = await edgeServerService.fetchDevices(authGuard, edgeRes.getData()[0].id)

        const res = await edgeServerService.updateDeviceConfig(
            authGuard,
            edgeRes.getData()[0].id,
            fetchRes.getData().id,
            "vendor 1000",
            "PDIP-2034",
            "camera",
            "mqtt",
            "",
            "rtsp://localhost:5666",
            0,
            0,
            '{"location": {"latitude": 10, "longitude": 10} }'
        )   

        // console.log(res)
        assert.equal(res.getStatusCode(), OperationStatus.updateDeviceError)

    })
})