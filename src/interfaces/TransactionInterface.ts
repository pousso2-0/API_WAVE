import { TransactionStatus } from "../enums/TransactionStatus";
import { TransactionType } from "../enums/TransactionType";
import { WalletInterface } from "./WalletInterface";

export interface TransactionInterface {
    id: string;
    senderWalletId: string;
    receiverWalletId: string;
    amount: number; // Decimal
    currency: string;
    status: TransactionStatus;
    type: TransactionType;
    reference: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
    feeAmount: number; // Decimal
    feeCurrency?: string; // Optional
    senderWallet: WalletInterface;
    receiverWallet: WalletInterface;
}