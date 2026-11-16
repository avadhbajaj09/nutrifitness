/**
 * Abandoned cart submissions are untrusted browser input.
 * Never let them overwrite legitimate pending/paid orders or another customer's lead.
 */
export function isValidAbandonedLeadId(value: string): boolean {
  return /^WEB-(?:[0-9a-f]{8}-[0-9a-f-]{27,}|[0-9]{6})$/i.test(value) ||
    /^LEAD-[0-9]{13}$/.test(value);
}

export interface ExistingLead {
  status?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
}

export function canUpdateAbandonedLead(
  existing: ExistingLead | null | undefined,
  customerEmail: string,
  customerPhone: string
): boolean {
  if (!existing) return true;
  if (existing.status !== 'abandoned') return false;
  const priorEmail = (existing.customer_email || '').trim().toLowerCase();
  const email = customerEmail.trim().toLowerCase();
  const priorPhone = (existing.customer_phone || '').replace(/\D/g, '');
  const phone = customerPhone.replace(/\D/g, '');
  if (priorEmail) return Boolean(email && priorEmail === email);
  if (priorPhone) return Boolean(phone && priorPhone === phone);
  return false;
}
