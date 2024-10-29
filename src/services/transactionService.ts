import { Transaction, TransactionStatus, TransactionType, Wallet } from "@prisma/client";
import prisma from "../config/prisma";
import { TimeFrame, TransactionVerificationResult } from "../types";
import { TimeFrameConfig } from "../interfaces/TimeFrameConfig";
import { WhereCondition } from "../interfaces/WhereCondition";
import { Decimal } from "decimal.js"; // Updated import statement
import { WalletService } from "./walletService";
import { RoleEnum } from "../enums/RoleEnum";


class TransactionService {
    private walletService: WalletService = WalletService.getInstance();


    private readonly timeFrameConfigs: Record<Exclude<TimeFrame, null>, TimeFrameConfig> = {
        day: { unit: 'date', value: 0 },
        week: { unit: 'date', value: 6 },
        month: { unit: 'month', value: 1 }
    };

    private getPaginationStart(page: number, limit: number): number {
        return (page - 1) * limit;
    }

    private getTimeFrameWhereCondition(timeFrame: TimeFrame): Record<string, any> {
        if (!timeFrame) return {};

        const now = new Date();


        const config = this.timeFrameConfigs[timeFrame];


        const startDate = new Date(now);

        if (config.unit === 'date') {
            startDate.setDate(now.getDate() - config.value);
        } else {
            startDate.setMonth(now.getMonth() - config.value);
        }

        return {
            createdAt: { gte: startDate }
        };
    }

    private async fetchPaginatedData(
        whereCondition: WhereCondition,
        page: number,
        limit: number
    ) {
        const start = this.getPaginationStart(page, limit);

        return Promise.all([
            prisma.transaction.findMany({
                skip: start,
                take: limit,
                where: whereCondition
            }),
            prisma.transaction.count({
                where: whereCondition
            })
        ]);
    }

    private async getWalletIds(userId: string): Promise<string[]> {
        const wallets = await prisma.wallet.findMany({
            where: { userId },
            select: { id: true }
        });

        if (!wallets.length) {
            throw new Error(`Aucun portefeuille associé à l'utilisateur avec l'id: ${userId}`);
        }

        return wallets.map(wallet => wallet.id);
    }

    private createTransactionWhereCondition(
        ids: string | string[],
        timeFrame: TimeFrame,
        isWalletId = true
    ): WhereCondition {
        const timeFrameCondition = this.getTimeFrameWhereCondition(timeFrame);
        const idList = Array.isArray(ids) ? ids : [ids];
        const fieldName = isWalletId ? 'WalletId' : 'userId';



        return {
            OR: [
                { [`sender${fieldName}`]: Array.isArray(ids) ? { in: idList } : ids },
                { [`receiver${fieldName}`]: Array.isArray(ids) ? { in: idList } : ids }
            ],
            ...timeFrameCondition
        };
    }

    public async getAll(
        page: number = 1,
        limit: number = 10,
        timeFrame: TimeFrame = null
    ) {
        const whereCondition = this.getTimeFrameWhereCondition(timeFrame);
        const [data, totalCount] = await this.fetchPaginatedData(
            whereCondition,
            page,
            limit
        );

        return { data, totalCount };
    }

    public async getAllByUser(
        userId: string,
        page: number = 1,
        limit: number = 10,
        timeFrame: TimeFrame = null
    ) {
        const walletIds = await this.getWalletIds(userId);
        const whereCondition = this.createTransactionWhereCondition(walletIds, timeFrame);
        const [data, totalCount] = await this.fetchPaginatedData(
            whereCondition,
            page,
            limit
        );

        return { data, totalCount };
    }

    public async getAllByWallet(
        walletId: string,
        page: number = 1,
        limit: number = 10,
        timeFrame: TimeFrame = null
    ) {
        const wallet = await this.getWallet(walletId);
        if (!wallet) {
            throw new Error(`Le portefeuille avec l'id: ${walletId} n'existe pas`);
        }

        const whereCondition = this.createTransactionWhereCondition(walletId, timeFrame);
        const [data, totalCount] = await this.fetchPaginatedData(
            whereCondition,
            page,
            limit
        );

        return { data, totalCount };
    }

    public async getWallet(id: string, includeUser: boolean = false): Promise<any> {
        const condition: any = {
            where: { id },
            ...(includeUser && { include: { user: { include: { role: true } } } })
        };
        
        return prisma.wallet.findUnique(condition);
    }


    public async getById(id: string) {
        return prisma.transaction.findFirst({ where: { id } });
    }

    public async addBalanceToUserAgent(userAgentWalletId: string, amount: number) {
        const wallet = await this.getWallet(userAgentWalletId, true);
        
        if (!wallet || !wallet.isActive) {
            throw new Error(`Le portefeuille avec l'ID: ${userAgentWalletId} est invalide ou inactif.`);
        }
        
        if (wallet.user.role.name !== RoleEnum.AGENT) {
            throw new Error(`Le portefeuille avec l'ID: ${userAgentWalletId} n'est pas associé à un agent.`);
        }
    
        // Convertir balance en nombre pour éviter la concaténation de chaînes
        const currentBalance = Number(wallet.balance);
    
        if (isNaN(currentBalance)) {
            throw new Error(`Le solde actuel du portefeuille n'est pas un nombre valide.`);
        }
    
        // Mise à jour du solde du portefeuille
        const updatedWallet = await prisma.wallet.update({
            data: { balance: currentBalance + amount },
            where: { id: userAgentWalletId }
        });
    
        return updatedWallet;
    }
    
    

    public async createTransaction(
        senderWalletId: string,
        receiverWalletId: string,
        typeTransaction: TransactionType,
        amount: number,
        currency: string,
        description?: string,
        feeAmount: number = 0,
        status: TransactionStatus = TransactionStatus.COMPLETED
    ): Promise<Transaction> {
        // Vérification des portefeuilles émetteur et destinataire
        const senderWallet = await this.getWallet(senderWalletId);
        const receiverWallet = await this.getWallet(receiverWalletId);

        if (!senderWallet || !senderWallet.isActive) {
            throw new Error(`Le portefeuille émetteur avec l'ID: ${senderWalletId} est invalide ou inactif.`);
        }

        if (!receiverWallet || !receiverWallet.isActive) {
            throw new Error(`Le portefeuille destinataire avec l'ID: ${receiverWalletId} est invalide ou inactif.`);
        }

        // Calcul du montant total (montant de la transaction + frais)
        const totalAmount = new Decimal(amount).plus(feeAmount);

        // Vérification de la possibilité de transaction
        const verificationResult = await this.walletService.verifyTransactionPossibility(senderWalletId, amount);
        if (!verificationResult.isPossible) {
            throw new Error("La transaction ne peut pas être effectuée en raison des limitations du portefeuille.");
        }

        // Utilisation d'une transaction Prisma pour garantir l'intégrité des opérations
        return await prisma.$transaction(async (prisma) => {
            // Création de la transaction
            const transaction = await prisma.transaction.create({
                data: {
                    senderWalletId,
                    receiverWalletId,
                    amount: new Decimal(amount),
                    currency,
                    status, // statut initial
                    type: typeTransaction,
                    reference: `TXN-${Date.now()}`, // Référence unique
                    description,
                    feeAmount: new Decimal(feeAmount),
                    feeCurrency: currency,
                }
            });

            // Mise à jour des soldes des portefeuilles
            await prisma.wallet.update({
                where: { id: senderWalletId },
                data: { balance: senderWallet.balance.minus(totalAmount) }
            });

            await prisma.wallet.update({
                where: { id: receiverWalletId },
                data: { balance: receiverWallet.balance.plus(amount) }
            });

            return transaction;
        });
    }
}

export default new TransactionService();
