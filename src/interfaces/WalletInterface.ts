import { TransactionInterface } from "./TransactionInterface";
import { UserInterface } from "./UserInterface";

export interface WalletInterface {
    id: string;
    userId: string;
    currency: string;
    qrCode: string;
    balance: number; 
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    dailyLimit?: number; 
    monthlyLimit?: number;
    user: UserInterface;
    sentTransactions: TransactionInterface[];
    receivedTransactions: TransactionInterface[];
}