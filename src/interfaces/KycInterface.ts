import { KycStatus } from "../enums/KycStatus";
import { UserInterface } from "./UserInterface";

export interface KycInterface {
    id: string;
    userId: string;
    documentType: string;
    documentNumber: string;
    verificationStatus: KycStatus;
    verifiedAt?: Date; // Optional
    verificationMethod?: string; // Optional
    rejectionReason?: string; // Optional
    user: UserInterface;
}
