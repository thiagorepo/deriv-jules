import { NextRequest, NextResponse } from 'next/server';
import { handleAndLogError } from '@/lib/error-logger';
import { badRequestResponse } from '@/lib/error-response';

/**
 * MFA resend endpoint
 * Sends a new MFA code to the user via the requested method
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { method: string } },
) {
  try {
    const { method } = params;

    if (!method) {
      const error = badRequestResponse('MFA method is required');
      return NextResponse.json(error, { status: 400 });
    }

    // TODO: Implement MFA code resend
    // - Send via email, SMS, or push notification
    // - Rate limit resend attempts
    // - Check if user has pending MFA setup

    console.log(`MFA resend request: method=${method}`);

    return NextResponse.json({
      success: true,
      message: 'MFA code resent successfully',
      method,
    });
  } catch (error: unknown) {
    const errorResponse = handleAndLogError(error, {
      action: 'mfa_resend',
      requestId: req.headers.get('x-request-id') ?? undefined,
    });
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
