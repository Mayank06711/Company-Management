import twilio from 'twilio';
import { ApiError } from './apiError';
class SmsService {
    private client: twilio.Twilio;

    constructor() {
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    async send(to: string, message: string) {
        try {
            const response = await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_SMS_NUMBER, // Twilio SMS number
                to: to,
            });

            console.log("SMS sent successfully \n", response.sid);
        } catch (error: any) {
            console.error("Error sending SMS \n", error);
            throw new ApiError(500, "SMS Service error", error.message);
        }
    }
}

export default new SmsService();
