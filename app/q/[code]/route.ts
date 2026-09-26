import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad|tablet/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : 'desktop';

  const baseUrl = request.nextUrl.origin;

  try {
    // 1. Try finding matching QR code item
    const qrItem = await db.getQRCodeByCode(code);
    if (qrItem && qrItem.active) {
      await db.recordQRScan(qrItem.id, qrItem.businessId, deviceType);
      const business = await db.getBusinessById(qrItem.businessId);
      if (business) {
        return NextResponse.redirect(`${baseUrl}/${business.slug}`, 307);
      }
    }

    // 2. Fallback: Check if code directly matches a business slug
    const directBusiness = await db.getBusinessBySlug(code);
    if (directBusiness) {
      return NextResponse.redirect(`${baseUrl}/${directBusiness.slug}`, 307);
    }
  } catch (err) {
    console.error('QR redirect error:', err);
  }

  // 3. Fallback to homepage
  return NextResponse.redirect(`${baseUrl}/`, 307);
}
