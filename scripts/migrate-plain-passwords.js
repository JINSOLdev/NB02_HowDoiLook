import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function migratePlainPasswords() {
  const styles = await prisma.style.findMany();
  for (const style of styles) {
    const pw = style.password;
    if (!pw.startsWith('$2b$')) {
      const hashed = await bcrypt.hash(pw, 10);
      await prisma.style.update({
        where: { styleId: style.styleId },
        data: { password: hashed },
      });
      console.log(`styleId: ${style.styleId} 비번 해싱 완료`);
    }
  }
}
migratePlainPasswords().finally(() => prisma.$disconnect());
