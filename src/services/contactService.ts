import { PrismaClient, Contact } from "@prisma/client";

class ContactService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createContact(data: {
    userId: string;
    contactId: string;
    nickname?: string;
  }): Promise<Contact> {
    return this.prisma.contact.create({
      data,
      select: {
        id: true,
        userId: true,
        contactId: true,
        nickname: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async getContactsByUserId(userId: string): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        contactId: true,
        nickname: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async getImportedGoogleContacts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true
      }
    });

    const contacts = await this.prisma.contact.findMany({
      where: { 
        userId,
        user: {
          googleAccessToken: {
            not: null
          }
        }
      },
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            photo: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      hasGoogleAuth: !!user?.googleAccessToken,
      contacts
    };
  }

  async updateContact(
    id: string,
    userId: string,
    data: { nickname?: string }
  ): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id },
      data,
      select: {
        id: true,
        userId: true,
        contactId: true,
        nickname: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async deleteContact(id: string, userId: string): Promise<void> {
    await this.prisma.contact.delete({
      where: { id }
    });
  }
}

export default ContactService;