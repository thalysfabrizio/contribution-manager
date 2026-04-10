import type { PaymentStatus } from '@/generated/prisma/client';

export type { PaymentStatus };

export type ParticipantWithPayments = {
  id: string;
  person: {
    id: string;
    name: string;
    phone: string;
  };
  payments: {
    id: string;
    month: Date;
    status: PaymentStatus;
  }[];
};

export type CampaignData = {
  id: string;
  name: string;
  description: string | null;
  pixKey: string;
  monthlyValue: number;
  startMonth: Date;
  endMonth: Date;
  paymentDayStart: number;
  paymentDayEnd: number;
  participants: ParticipantWithPayments[];
};

export type CampaignListItem = {
  id: string;
  name: string;
  description: string | null;
  startMonth: Date;
  endMonth: Date;
  participantCount: number;
  isEnded: boolean;
};
