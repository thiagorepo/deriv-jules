import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '../../utils/response';
import { createLogger } from '../../utils/logger';

interface SignUpRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface SignUpResponse {
  userId: string;
  email: string;
  sessionToken: string;
  requiresVerification: boolean;
}

export async function POST(request: NextRequest) {
  const logger = createLogger({
    endpoint: '/api/auth/sign-up',
    method: 'POST',
    timestamp: new Date().toISOString(),
  });

  try {
    const body: SignUpRequest = await request.json();

    // Validate request
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      logger.warn('Missing required registration fields', {
        email: body.email,
      });
      return errorResponse(
        'INVALID_REQUEST',
        'Email, password, firstName, and lastName are required',
        400,
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return errorResponse('INVALID_EMAIL', 'Invalid email format', 400);
    }

    // Password validation (minimum 8 characters)
    if (body.password.length < 8) {
      return errorResponse(
        'WEAK_PASSWORD',
        'Password must be at least 8 characters long',
        400,
      );
    }

    logger.info('Registration attempt', { email: body.email });

    // TODO: Implement actual user creation with Supabase
    const response: SignUpResponse = {
      userId: `USER_${Date.now()}`,
      email: body.email,
      sessionToken: `TOKEN_${Date.now()}_${Math.random()}`,
      requiresVerification: true,
    };

    return successResponse(response, 201);
  } catch (error) {
    const err = error as Error;
    logger.error('Registration failed', err);

    if (err.message.includes('duplicate')) {
      return errorResponse('EMAIL_EXISTS', 'Email already registered', 409);
    }

    return errorResponse('REGISTRATION_ERROR', 'Registration failed', 500);
  }
}
