import { NotificationType } from "../enums/NotificationType";
import { UserInterface } from "./UserInterface";

export interface NotificationInterface {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
    readAt?: Date; // Optional
    priority: string;
    user?: UserInterface;
}
