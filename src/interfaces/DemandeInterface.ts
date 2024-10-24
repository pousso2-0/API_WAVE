import { Date } from "mongoose";
import { AccountRequestStatus } from "../enums/AccountRequestStatus";

export interface DemandeInterface {
    id: number,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    idCardFrontPhoto: string,
    idCardBackPhoto: string, 
    createdAt: Date,
    status: AccountRequestStatus
}