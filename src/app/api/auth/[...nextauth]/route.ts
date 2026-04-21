import { handlers } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

type Handler = (req: Request) => Promise<Response> | Response;

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function tooManyRequests(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ error: 'Too Many Requests', retryAfter }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    },
  );
}

async function applyRateLimit(req: Request): Promise<Response | null> {
  const ip = getClientIp(req);
  const ipCheck = await checkRateLimit(`ip:${ip}`, 20, 60_000);
  if (!ipCheck.allowed) {
    return tooManyRequests(ipCheck.retryAfter);
  }

  const url = new URL(req.url);
  const isMagicLinkPost =
    req.method === 'POST' &&
    /\/api\/auth\/signin\/(resend|email)/.test(url.pathname);

  if (isMagicLinkPost) {
    try {
      const form = await req.clone().formData();
      const raw = form.get('email');
      const email = typeof raw === 'string' ? raw.trim().toLowerCase() : null;
      if (email) {
        const emailCheck = await checkRateLimit(`email:${email}`, 5, 15 * 60_000);
        if (!emailCheck.allowed) {
          return tooManyRequests(emailCheck.retryAfter);
        }
      }
    } catch {
      // Se não for possível ler o form, apenas seguimos com o rate limit por IP.
    }
  }

  return null;
}

const authGET = handlers.GET as Handler;
const authPOST = handlers.POST as Handler;

export async function GET(req: Request) {
  const blocked = await applyRateLimit(req);
  if (blocked) return blocked;
  return authGET(req);
}

export async function POST(req: Request) {
  const blocked = await applyRateLimit(req);
  if (blocked) return blocked;
  return authPOST(req);
}
