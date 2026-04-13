import {
  brandingSchema,
  campaignSchema,
  emailSchema,
  isValidPixKey,
  participantSchema,
  paymentStatusSchema,
  pixKeySchema,
  safeHttpsUrlSchema,
} from './validators';

describe('campaignSchema', () => {
  const valid = {
    name: 'Campanha Teste',
    description: 'Descrição',
    pixKey: 'pix@teste.com',
    monthlyValue: 5000,
    startMonth: new Date('2026-01-01'),
    endMonth: new Date('2026-12-01'),
    paymentDayStart: 10,
    paymentDayEnd: 15,
  };

  it('aceita dados válidos completos', () => {
    expect(() => campaignSchema.parse(valid)).not.toThrow();
  });

  it('rejeita nome vazio', () => {
    const result = campaignSchema.safeParse({ ...valid, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita nome > 100 caracteres', () => {
    const result = campaignSchema.safeParse({ ...valid, name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('aceita descrição ausente', () => {
    const { description: _, ...semDescricao } = valid;
    expect(() => campaignSchema.parse(semDescricao)).not.toThrow();
  });

  it('rejeita descrição > 500 caracteres', () => {
    const result = campaignSchema.safeParse({ ...valid, description: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('rejeita pixKey vazio', () => {
    const result = campaignSchema.safeParse({ ...valid, pixKey: '' });
    expect(result.success).toBe(false);
  });

  it('rejeita monthlyValue zero', () => {
    const result = campaignSchema.safeParse({ ...valid, monthlyValue: 0 });
    expect(result.success).toBe(false);
  });

  it('rejeita monthlyValue negativo', () => {
    const result = campaignSchema.safeParse({ ...valid, monthlyValue: -100 });
    expect(result.success).toBe(false);
  });

  it('rejeita monthlyValue decimal', () => {
    const result = campaignSchema.safeParse({ ...valid, monthlyValue: 50.5 });
    expect(result.success).toBe(false);
  });

  it('rejeita paymentDayStart < 1', () => {
    const result = campaignSchema.safeParse({ ...valid, paymentDayStart: 0 });
    expect(result.success).toBe(false);
  });

  it('rejeita paymentDayStart > 31', () => {
    const result = campaignSchema.safeParse({ ...valid, paymentDayStart: 32 });
    expect(result.success).toBe(false);
  });

  it('rejeita paymentDayEnd < 1', () => {
    const result = campaignSchema.safeParse({ ...valid, paymentDayEnd: 0 });
    expect(result.success).toBe(false);
  });

  it('rejeita paymentDayEnd > 31', () => {
    const result = campaignSchema.safeParse({ ...valid, paymentDayEnd: 32 });
    expect(result.success).toBe(false);
  });
});

describe('participantSchema', () => {
  it('aceita telefone com 10 dígitos', () => {
    expect(() => participantSchema.parse({ name: 'João', phone: '1134567890' })).not.toThrow();
  });

  it('aceita telefone com 11 dígitos', () => {
    expect(() => participantSchema.parse({ name: 'João', phone: '11934567890' })).not.toThrow();
  });

  it('rejeita telefone com 9 dígitos', () => {
    const result = participantSchema.safeParse({ name: 'João', phone: '123456789' });
    expect(result.success).toBe(false);
  });

  it('rejeita telefone com 12 dígitos', () => {
    const result = participantSchema.safeParse({ name: 'João', phone: '551134567890' });
    expect(result.success).toBe(false);
  });

  it('rejeita telefone com letras', () => {
    const result = participantSchema.safeParse({ name: 'João', phone: '11abcdefghi' });
    expect(result.success).toBe(false);
  });

  it('rejeita nome vazio', () => {
    const result = participantSchema.safeParse({ name: '', phone: '11934567890' });
    expect(result.success).toBe(false);
  });
});

describe('paymentStatusSchema', () => {
  it.each(['PENDING', 'PAID_PIX', 'PAID_CASH', 'LATE'])('aceita status válido: %s', (status) => {
    expect(() => paymentStatusSchema.parse(status)).not.toThrow();
  });

  it('rejeita status inválido', () => {
    const result = paymentStatusSchema.safeParse('CANCELLED');
    expect(result.success).toBe(false);
  });

  it('rejeita string vazia', () => {
    const result = paymentStatusSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('aceita email válido e normaliza para lowercase', () => {
    const result = emailSchema.parse('TESTE@Teste.COM');
    expect(result).toBe('teste@teste.com');
  });

  it('aceita email com espaços e faz trim antes de validar', () => {
    const result = emailSchema.parse('  teste@teste.com  ');
    expect(result).toBe('teste@teste.com');
  });

  it('rejeita string vazia', () => {
    const result = emailSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejeita email inválido', () => {
    const result = emailSchema.safeParse('nao-e-email');
    expect(result.success).toBe(false);
  });
});

describe('safeHttpsUrlSchema', () => {
  it.each([
    'https://example.com/logo.png',
    'https://cdn.com/a/b/c.jpg',
    'https://sub.domain.com.br/img.webp?x=1',
  ])('aceita URL https válida: %s', (url) => {
    expect(safeHttpsUrlSchema.parse(url)).toBe(url);
  });

  it.each([
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'vbscript:msgbox(1)',
    'about:blank',
    'blob:https://example.com/abc',
  ])('rejeita protocolo perigoso: %s', (url) => {
    const result = safeHttpsUrlSchema.safeParse(url);
    expect(result.success).toBe(false);
  });

  it('rejeita http:// (apenas https é permitido)', () => {
    const result = safeHttpsUrlSchema.safeParse('http://example.com');
    expect(result.success).toBe(false);
  });

  it('rejeita string vazia', () => {
    const result = safeHttpsUrlSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejeita URL malformada', () => {
    const result = safeHttpsUrlSchema.safeParse('isso não é uma url');
    expect(result.success).toBe(false);
  });

  it('rejeita URL excessivamente longa', () => {
    const long = 'https://example.com/' + 'a'.repeat(3000);
    const result = safeHttpsUrlSchema.safeParse(long);
    expect(result.success).toBe(false);
  });
});

describe('brandingSchema', () => {
  const valid = {
    orgName: 'Igreja Exemplo',
    logoUrl: 'https://cdn.example.com/logo.png',
    bannerUrl: 'https://cdn.example.com/banner.jpg',
    accentColor: '#8b5cf6',
    messageSignature: 'Que Deus abençoe',
  };

  it('aceita um branding completo e válido', () => {
    expect(() => brandingSchema.parse(valid)).not.toThrow();
  });

  it('aceita todos os campos nulos (branding vazio)', () => {
    const empty = {
      orgName: null,
      logoUrl: null,
      bannerUrl: null,
      accentColor: null,
      messageSignature: null,
    };
    expect(() => brandingSchema.parse(empty)).not.toThrow();
  });

  it('rejeita logoUrl com javascript:', () => {
    const result = brandingSchema.safeParse({ ...valid, logoUrl: 'javascript:alert(1)' });
    expect(result.success).toBe(false);
  });

  it('rejeita bannerUrl com data:', () => {
    const result = brandingSchema.safeParse({
      ...valid,
      bannerUrl: 'data:image/png;base64,iVBOR',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita accentColor em formato inválido', () => {
    const result = brandingSchema.safeParse({ ...valid, accentColor: 'purple' });
    expect(result.success).toBe(false);
  });

  it('aceita accentColor em formato #rrggbb minúsculo ou maiúsculo', () => {
    expect(brandingSchema.safeParse({ ...valid, accentColor: '#AABBCC' }).success).toBe(true);
    expect(brandingSchema.safeParse({ ...valid, accentColor: '#aabbcc' }).success).toBe(true);
  });

  it('rejeita orgName excessivamente longo', () => {
    const result = brandingSchema.safeParse({ ...valid, orgName: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe('isValidPixKey / pixKeySchema', () => {
  describe('email', () => {
    it.each(['pix@example.com', 'Joao.Silva@igreja.com.br', 'a+b@c.co'])(
      'aceita email válido: %s',
      (k) => {
        expect(isValidPixKey(k)).toBe(true);
      },
    );
    it.each(['sem-arroba', 'dois@@sinais.com', '@sem-local.com', 'sem-dominio@', 'com espaço@a.com'])(
      'rejeita email inválido: %s',
      (k) => {
        expect(isValidPixKey(k)).toBe(false);
      },
    );
  });

  describe('telefone BR', () => {
    it.each(['1134567890', '11934567890', '8399001001', '83999001001'])(
      'aceita telefone de %d dígitos: %s',
      (k) => {
        expect(isValidPixKey(k)).toBe(true);
      },
    );
    it.each(['119345', '551134567890', '1193456789a'])('rejeita telefone inválido: %s', (k) => {
      expect(isValidPixKey(k)).toBe(false);
    });
  });

  describe('CPF', () => {
    it.each(['52998224725', '11144477735', '39053344705'])('aceita CPF válido: %s', (k) => {
      expect(isValidPixKey(k)).toBe(true);
    });
    it.each([
      '00000000000',
      '11111111111',
      '12345678901',
      '11144477736',
    ])('rejeita CPF inválido: %s', (k) => {
      expect(isValidPixKey(k)).toBe(false);
    });
  });

  describe('CNPJ numérico (formato legado)', () => {
    it.each(['11444777000161', '45723174000110', '60746948000112'])(
      'aceita CNPJ válido: %s',
      (k) => {
        expect(isValidPixKey(k)).toBe(true);
      },
    );
    it.each([
      '00000000000000',
      '11111111111111',
      '12345678000100',
      '11444777000162',
    ])('rejeita CNPJ inválido: %s', (k) => {
      expect(isValidPixKey(k)).toBe(false);
    });

    it('aceita CNPJ com separadores formatados', () => {
      expect(isValidPixKey('11.444.777/0001-61')).toBe(true);
    });
  });

  describe('CNPJ alfanumérico (IN RFB 2229/2024, jul/2026)', () => {
    it('aceita CNPJ alfanumérico exemplificado pela Receita (12ABC34501DE35)', () => {
      expect(isValidPixKey('12ABC34501DE35')).toBe(true);
    });

    it('aceita o mesmo CNPJ alfanumérico em minúsculas e com separadores', () => {
      expect(isValidPixKey('12.abc.345/01de-35')).toBe(true);
    });

    it('rejeita CNPJ alfanumérico com DV incorreto', () => {
      expect(isValidPixKey('12ABC34501DE34')).toBe(false);
    });

    it('rejeita CNPJ alfanumérico com letra nos últimos 2 caracteres', () => {
      expect(isValidPixKey('12ABC34501DEAB')).toBe(false);
    });

    it('rejeita 14 caracteres todos iguais', () => {
      expect(isValidPixKey('AAAAAAAAAAAAAA')).toBe(false);
    });
  });

  describe('chave aleatória (UUID v4)', () => {
    it.each([
      '550e8400-e29b-41d4-a716-446655440000',
      '123e4567-e89b-42d3-a456-556642440000',
      '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
    ])('aceita UUID v4 válido: %s', (k) => {
      expect(isValidPixKey(k)).toBe(true);
    });
    it.each([
      'not-a-uuid',
      '550e8400-e29b-41d4-a716-44665544',
      '550e8400e29b41d4a716446655440000',
      '550e8400-e29b-31d4-a716-446655440000',
    ])('rejeita UUID inválido ou não-v4: %s', (k) => {
      expect(isValidPixKey(k)).toBe(false);
    });
  });

  it('rejeita string vazia', () => {
    expect(pixKeySchema.safeParse('').success).toBe(false);
  });

  it('rejeita string só com espaços', () => {
    expect(pixKeySchema.safeParse('   ').success).toBe(false);
  });

  it('pixKeySchema retorna mensagem de erro indicando formatos aceitos', () => {
    const result = pixKeySchema.safeParse('nao-e-nada');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/email|CPF|CNPJ|UUID|telefone/i);
    }
  });
});
