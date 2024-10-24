import { UserInterface } from "./UserInterface";

export interface ContactInterface {
    id: string;
    userId: string;
    contactId: string;
    nickname?: string; // Optional
    createdAt: Date;
    updatedAt: Date;
    user: UserInterface;
    contact: UserInterface;
}