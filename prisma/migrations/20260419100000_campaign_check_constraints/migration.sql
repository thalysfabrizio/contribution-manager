-- Integridade adicional na tabela Campaign via CHECK constraints.
ALTER TABLE "Campaign"
  ADD CONSTRAINT "campaign_dates_check" CHECK ("startMonth" < "endMonth"),
  ADD CONSTRAINT "campaign_value_check" CHECK ("monthlyValue" > 0),
  ADD CONSTRAINT "campaign_days_check" CHECK (
    "paymentDayStart" BETWEEN 1 AND 31
    AND "paymentDayEnd" BETWEEN 1 AND 31
    AND "paymentDayStart" <= "paymentDayEnd"
  );
