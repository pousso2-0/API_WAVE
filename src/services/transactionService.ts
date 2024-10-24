import prisma from "../config/prisma"


export default new class transactionService {

    async getAll(start: number = 0, limit: number = 10) {
        return prisma.transaction.findMany({
            skip: start * limit,
            take: limit,    
        });
    }

}
