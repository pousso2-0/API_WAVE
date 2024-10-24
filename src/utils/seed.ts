import { PrismaClient } from '@prisma/client';
import { fa, faker } from '@faker-js/faker';
import hashService from '../security/hashService';
import { generateQRCodeService } from '../services/generateQRCodeService';

const prisma = new PrismaClient();

function generateSenegalesePhoneNumber() {
    const operatorPrefix = faker.helpers.arrayElement(['70', '76', '77', '78']);
    const phoneNumber = `${operatorPrefix}${faker.number.int({ min: 1000000, max: 9999999 })}`;
    return `+221${phoneNumber}`;
}

async function createRoles() {
    const roles = ['USER', 'ADMIN', 'AGENT']; // Define the roles you want to create

    for (const roleName of roles) {
        // Check if the role already exists
        const existingRole = await prisma.role.findUnique({
            where: { name: roleName },
        });

        if (!existingRole) {
            await prisma.role.create({
                data: {
                    name: roleName,
                },
            });
            console.log(`Role created: ${roleName}`);
        } else {
            console.log(`Role already exists: ${roleName}`);
        }
    }
}

async function createUsers(count: number) {
    const users = [];
    const roles = await prisma.role.findMany(); // Récupérer tous les rôles

    for (let i = 0; i < count; i++) {
        const user = await prisma.user.create({
            data: {
                email: faker.internet.email(),
                phoneNumber: generateSenegalesePhoneNumber(),
                passwordHash: await hashService.hash("0000"), 
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                dateOfBirth: faker.date.past({ years: 30 }), 
                address: faker.location.streetAddress(), 
                city: faker.location.city(),
                country: faker.location.country(),
                isVerified: faker.datatype.boolean(),
                role: { 
                    connect: { id: faker.helpers.arrayElement(roles).id }, 
                },
                wallets: {
                    create: [
                        {
                            currency: 'USD',
                            qrCode: await generateQRCodeService(faker.string.uuid(), false) as string,
                            balance: faker.number.int({ min: 1, max: 1000 }),
                        },
                    ],
                },
            },
            include: { wallets: true },
        });

        users.push(user);
    }

    return users;
}

async function createTransactions(users: any[]) {
    const transactions = [];

    for (let i = 0; i < 10; i++) {
        const sender = faker.helpers.arrayElement(users);
        const receiver = faker.helpers.arrayElement(users.filter(u => u.id !== sender.id));

        const transaction = await prisma.transaction.create({
            data: {
                senderWalletId: sender.wallets[0].id,
                receiverWalletId: receiver.wallets[0].id,
                amount: faker.number.int({ min: 1, max: 500 }),
                currency: 'USD',
                status: 'COMPLETED',
                type: 'TRANSFER',
                reference: faker.string.uuid(),
            },
        });

        transactions.push(transaction);
    }

    return transactions;
}

async function createNotifications(users: any[]) {
    for (const user of users) {
        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'INFO',
                title: 'Welcome!',
                content: faker.lorem.sentence(),
            },
        });
    }
}

async function createContacts(users: any[]) {
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const contactCount = faker.number.int({ min: 1, max: 5 });

        for (let j = 0; j < contactCount; j++) {
            const contact = faker.helpers.arrayElement(users.filter(u => u.id !== user.id));

            // Vérifier si le contact existe déjà avant de le créer
            const existingContact = await prisma.contact.findFirst({
                where: {
                    userId: user.id,
                    contactId: contact.id,
                },
            });

            if (!existingContact) {
                await prisma.contact.create({
                    data: {
                        userId: user.id,
                        contactId: contact.id,
                        nickname: faker.person.firstName(),
                    },
                });
            } else {
                console.log(`Contact already exists between user ${user.id} and contact ${contact.id}.`);
            }
        }
    }
}

async function createKyc(users: any[]) {
    for (const user of users) {
        await prisma.kyc.create({
            data: {
                userId: user.id,
                documentType: 'Passport',
                documentNumber: faker.string.uuid(),
                verificationStatus: 'VERIFIED',
                verifiedAt: new Date(),
                verificationMethod: 'Manual',
            },
        });
    }
}

async function main() {
    await createRoles(); // Call createRoles to create roles
    const userCount = 5;
    const users = await createUsers(userCount);
    await createTransactions(users);
    await createNotifications(users);
    await createContacts(users);
    await createKyc(users);

    console.log('Seed completed.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
