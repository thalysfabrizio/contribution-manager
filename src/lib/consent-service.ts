interface ConsentPrisma {
  user: {
    findUnique: (args: {
      where: { id: string };
      select: { consentAt: true };
    }) => Promise<{ consentAt: Date | null } | null>;
    update: (args: {
      where: { id: string };
      data: { consentAt: Date; consentVersion: string };
    }) => Promise<unknown>;
  };
}

export async function recordConsentIfMissing(
  prisma: ConsentPrisma,
  userId: string,
  version: string,
): Promise<boolean> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { consentAt: true },
  });
  if (!existing || existing.consentAt) return false;
  await prisma.user.update({
    where: { id: userId },
    data: {
      consentAt: new Date(),
      consentVersion: version,
    },
  });
  return true;
}
