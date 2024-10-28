import { ContactInterface } from './ContactInterface';

export interface ContactServiceInterface {
    createContact(userId: string, contactId: string, nickname?: string): Promise<ContactInterface>;
    getContactsByUserId(userId: string): Promise<ContactInterface[]>;
    deleteContact(userId: string, contactId: string): Promise<void>;
    updateContactNickname(userId: string, contactId: string, nickname: string): Promise<ContactInterface>;
}