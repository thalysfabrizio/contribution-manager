export function getE2EDatabaseUrl(): string {
  const e2eUrl = process.env.E2E_DATABASE_URL;
  const devUrl = process.env.DATABASE_URL;

  if (!e2eUrl) {
    throw new Error(
      'E2E_DATABASE_URL não definida. Os testes E2E apagam dados — exigem banco dedicado separado do dev. ' +
      'Veja README seção "E2E".',
    );
  }
  if (e2eUrl === devUrl) {
    throw new Error(
      'E2E_DATABASE_URL é igual a DATABASE_URL. Use um banco diferente para E2E — a globalSetup apaga todos os usuários.',
    );
  }
  return e2eUrl;
}
