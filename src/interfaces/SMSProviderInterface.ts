export interface SMSProviderInterface {
  sendSMS(to: string, content: string): Promise<void>;
}