/**
 * Swiss Post (La Poste Suisse / Die Post) - Digital Commerce API
 * Barcode & A6 Shipping Label Generator
 */

import { getSwissPostAccessToken } from './auth';

export interface LabelRecipient {
  title?: string;
  name: string;
  street: string;
  zip: string;
  city: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface GenerateLabelOptions {
  orderId: string;
  recipient: LabelRecipient;
  weightKg?: number;
  service?: 'PRI' | 'ECO';
  printPreview?: boolean;
}

export interface GeneratedLabelResult {
  success: boolean;
  trackingNumber: string;
  formattedTrackingNumber: string;
  pdfBase64: string;
  pdfBuffer: Buffer;
  warnings?: any[];
}

export async function generateSwissPostLabel(options: GenerateLabelOptions): Promise<GeneratedLabelResult> {
  const token = await getSwissPostAccessToken();

  const barcodeUrl = process.env.SWISSPOST_BARCODE_URL || 'https://dcapi.apis.post.ch/barcode/v1/generateAddressLabel';
  const frankingLicense = process.env.SWISSPOST_FRANKING_LICENSE || '60178154';
  
  // printPreview: true for free specimen, false for live postage
  const printPreview = options.printPreview !== undefined 
    ? options.printPreview 
    : (process.env.SWISSPOST_PRINT_PREVIEW === 'true');

  const senderName1 = process.env.SWISSPOST_SENDER_NAME1 || 'NUTRIFITNESS';
  const senderName2 = process.env.SWISSPOST_SENDER_NAME2 || '';
  const senderStreet = process.env.SWISSPOST_SENDER_STREET || 'Rue des Pâquis 34';
  const senderZip = process.env.SWISSPOST_SENDER_ZIP || '1201';
  const senderCity = process.env.SWISSPOST_SENDER_CITY || 'Genève';
  const senderCountry = process.env.SWISSPOST_SENDER_COUNTRY || 'CH';

  const payload = {
    language: 'FR',
    frankingLicense: frankingLicense,
    ppFranking: false,
    customer: {
      name1: senderName1,
      name2: senderName2 || undefined,
      street: senderStreet,
      zip: senderZip,
      city: senderCity,
      country: senderCountry,
      logoRotation: 0,
      domicilePostOffice: `${senderZip} ${senderCity}`,
    },
    labelDefinition: {
      labelLayout: 'A6',
      printAddresses: 'RECIPIENT_AND_CUSTOMER',
      imageFileType: 'PDF',
      imageResolution: 300,
      printPreview: printPreview,
    },
    item: {
      itemID: options.orderId.slice(0, 30),
      recipient: {
        title: options.recipient.title || undefined,
        name1: options.recipient.name,
        street: options.recipient.street,
        zip: String(options.recipient.zip).trim(),
        city: options.recipient.city,
        country: options.recipient.country || 'CH',
        email: options.recipient.email || undefined,
      },
      attributes: {
        przl: [options.service || 'PRI'],
        weight: options.weightKg || 1.0,
      },
    },
  };

  const response = await fetch(barcodeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => null);
    const errorText = errorJson ? JSON.stringify(errorJson) : await response.text();
    console.error('[Swiss Post Barcode API Error]', response.status, errorText);
    throw new Error(`Swiss Post Barcode generation failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const identCode = data.item?.identCode;
  const labelArray = data.item?.label;

  if (!identCode || !Array.isArray(labelArray) || !labelArray[0]) {
    throw new Error('Swiss Post API responded without a valid IdentCode or PDF label.');
  }

  const pdfBase64 = labelArray[0];
  const pdfBuffer = Buffer.from(pdfBase64, 'base64');

  // Format 18-digit IdentCode as 99.60.178154.00000001
  const raw = String(identCode).replace(/\D/g, '');
  let formattedTracking = identCode;
  if (raw.length === 18) {
    formattedTracking = `${raw.slice(0, 2)}.${raw.slice(2, 4)}.${raw.slice(4, 10)}.${raw.slice(10, 18)}`;
  }

  return {
    success: true,
    trackingNumber: raw,
    formattedTrackingNumber: formattedTracking,
    pdfBase64,
    pdfBuffer,
    warnings: data.warnings,
  };
}
