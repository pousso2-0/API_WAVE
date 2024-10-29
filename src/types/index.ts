import { Prisma } from "@prisma/client";

export type TimeFrame = 'day' | 'week' | 'month' | null;

export type WalletLimits = {
    dailyLimit?: number;
    monthlyLimit?: number;
};

export type WalletProperties = {
    isActive?: boolean;
    currency?: string;
};

export type TransactionVerificationResult = {
    isPossible: boolean;
    currentBalance: Prisma.Decimal;
    totalPendingAmount: Prisma.Decimal;
    remainingBalance: Prisma.Decimal;
    dailyLimitExceeded?: boolean;
    monthlyLimitExceeded?: boolean;
    plafondExceeded?: boolean;
};