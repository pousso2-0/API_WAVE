import prisma from "../config/prisma";

export default new class userService {

    phoneExist(phone: string): Promise<any> {
        return prisma.user.findUnique({ where: { phoneNumber: phone }, include: { role: true } });
    }

}