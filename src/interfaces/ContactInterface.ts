import { UserInterface } from "./UserInterface";

export interface ContactInterface {
    id: string;
    userId: string;
    contactId: string;
    nickname: string | null;  
    createdAt: Date;
    updatedAt: Date;
    user: UserInterface;
    contact: UserInterface;
}