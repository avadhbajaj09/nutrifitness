function isStubMode(): boolean {
  const key = process.env.RESEND_API_KEY || '';
  return key.startsWith('stub_') || !key;
}

export async function sendOrderConfirmation(email: string, orderData: any) {
  if (isStubMode()) {
    console.warn(`[Resend STUB MODE] sendOrderConfirmation to ${email}`);
    return;
  }
  // Real implementation
}

export async function sendShipmentUpdate(email: string, shipmentData: any) {
  if (isStubMode()) {
    console.warn(`[Resend STUB MODE] sendShipmentUpdate to ${email}`);
    return;
  }
  // Real implementation
}

export async function sendDeliveryConfirmation(email: string, deliveryData: any) {
  if (isStubMode()) {
    console.warn(`[Resend STUB MODE] sendDeliveryConfirmation to ${email}`);
    return;
  }
  // Real implementation
}
