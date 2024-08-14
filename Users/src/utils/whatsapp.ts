import twilio from 'twilio';
import {ApiError} from "../utils/apiError"
class WhatsappService {
    private client: twilio.Twilio;
    constructor() {
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    async send(to: string, message: string) {
        try {
            console.log(to, message, "sdh")
            const response = await this.client.messages.create({
                body: message,
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Twilio WhatsApp number
                to: `whatsapp:${to}`, // this number must be verified on twilio 
            },(err)=>{console.log(err)});

            console.log("WhatsApp message sent successfully \n", response);
        } catch (error: any) {
            console.error("Error sending WhatsApp message \n", error);
            throw new ApiError(500, "WhatsApp Service error", error.message);
        }
    }
}

export default new WhatsappService();
