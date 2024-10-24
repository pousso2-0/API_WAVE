import { User } from "@prisma/client";
import prisma from "../config/prisma";

export default new class userService {

    phoneExist(phone: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { phoneNumber: phone }, include: { role: true } });
    }

}