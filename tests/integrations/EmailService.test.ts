import assert from 'assert'
import { IEmailService } from '../../src/contracts/usecases/IEmailService'
import { EmailService } from '../../src/usecases/email/EmailService'
import dotenv from 'dotenv'

dotenv.config()

let emailService: IEmailService

beforeAll(() => {
    emailService = new EmailService(
        process.env.SMTP_HOST!, 
        parseInt(process.env.SMTP_PORT!),
        process.env.SMTP_USER!,
        process.env.SMTP_PASS!,
        "support@smartcube.com", 
        "Smartcube")
})

describe("Email Service", () => {

    it("send email", async () => {
        const resp = await emailService.sendEmail("test@gmail.com", 'test', 'test body')
        // console.log(resp)
        assert.equal(resp.getStatus(), true)
    })
})

afterAll(() => {
    emailService.closeService()
})