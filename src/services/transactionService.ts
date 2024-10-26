import { Wallet } from "@prisma/client";
import prisma from "../config/prisma";
import { TimeFrame } from "../types";
import { TimeFrameConfig } from "../interfaces/TimeFrameConfig";
import { WhereCondition } from "../interfaces/WhereCondition";




class TransactionService {
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

    public async getWallet(id: string): Promise<Wallet | null> {
        return prisma.wallet.findUnique({
            where: { id }
        });
    }
}

export default new TransactionService();