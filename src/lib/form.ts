export function getStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

export function getOptStr(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === 'string' && v !== '' ? v : null;
}
