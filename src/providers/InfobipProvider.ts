import { SMSProviderInterface } from "../interfaces/SMSProviderInterface";
import axios from "axios";

export class InfobipProvider implements SMSProviderInterface {
  async sendSMS(to: string, content: string): Promise<void> {
    await axios.post("https://2mkx5z.api.infobip.com/sms/1/text/single", {
      from: "Wave",
      to,
      text: content,
    }, {
      headers: {
        Authorization: `App ${process.env.INFOBIP_API_KEY}`,
      },
    });
    console.log(`Message envoyé via Infobip à ${to}`);
  }
}
