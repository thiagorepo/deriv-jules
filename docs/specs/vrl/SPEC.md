# VRL: Validation Rules Layer

> **Spec ID:** VRL-001
> **Version:** 1.0.0
> **Status:** DRAFT
> **Last Updated:** 2026-03-28

---

## 1. Overview

The Validation Rules Layer defines all validation schemas using Zod for type-safe runtime validation across forms, API inputs, and data boundaries.

### Validation Library

- **Zod** - TypeScript-first schema validation
- **Integration** - React Hook Form resolvers
- **Scope** - Forms, API routes, WebSocket messages

---

## 2. Authentication Schemas

### 2.1 Login Schema

```typescript
// libs/shared/schemas/src/lib/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### 2.2 Registration Schema

```typescript
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

### 2.3 Password Reset Schema

```typescript
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

---

## 3. User Profile Schemas

### 3.1 Profile Update Schema

```typescript
// libs/shared/schemas/src/lib/profile.ts
export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  avatarUrl: z
    .string()
    .url('Invalid URL')
    .optional()
    .nullable(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
```

### 3.2 Role Assignment Schema

```typescript
export const roleSchema = z.enum(['admin', 'user']);

export const assignRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: roleSchema,
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
```

---

## 4. Trading Schemas

### 4.1 Buy Contract Schema

```typescript
// libs/shared/schemas/src/lib/trading.ts
export const contractTypeSchema = z.enum([
  'CALL',
  'PUT',
  'DIGITDIFF',
  'DIGITMATCH',
  'DIGITOVER',
  'DIGITUNDER',
  'EXPIRYMISS',
  'EXPIRYRANGE',
  'HIGHERLOWER',
  'TOUCHNOTOUCH',
]);

export const durationUnitSchema = z.enum(['s', 'm', 'h', 'd']);

export const buyContractSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .regex(/^[A-Z]+$/, 'Symbol must be uppercase letters'),
  type: contractTypeSchema,
  stake: z
    .number()
    .positive('Stake must be positive')
    .min(1, 'Minimum stake is 1')
    .max(10000, 'Maximum stake is 10,000'),
  duration: z
    .number()
    .int('Duration must be a whole number')
    .positive('Duration must be positive')
    .min(1, 'Minimum duration is 1')
    .max(365, 'Maximum duration is 365'),
  durationUnit: durationUnitSchema,
});

export type BuyContractInput = z.infer<typeof buyContractSchema>;
```

### 4.2 Sell Contract Schema

```typescript
export const sellContractSchema = z.object({
  contractId: z
    .string()
    .min(1, 'Contract ID is required'),
  price: z
    .number()
    .positive('Price must be positive'),
});

export type SellContractInput = z.infer<typeof sellContractSchema>;
```

### 4.3 Trade Filter Schema

```typescript
export const tradeFilterSchema = z.object({
  symbol: z.string().optional(),
  status: z.enum(['open', 'closed', 'all']).optional(),
  type: contractTypeSchema.optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type TradeFilterInput = z.infer<typeof tradeFilterSchema>;
```

---

## 5. Admin Schemas

### 5.1 User Management Schema

```typescript
// libs/shared/schemas/src/lib/admin.ts
export const userStatusSchema = z.enum(['active', 'suspended', 'pending']);

export const updateUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  status: userStatusSchema.optional(),
  role: roleSchema.optional(),
  emailVerified: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userQuerySchema = z.object({
  search: z.string().optional(),
  status: userStatusSchema.optional(),
  role: roleSchema.optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;
```

### 5.2 Product Schema

```typescript
export const productCategorySchema = z.enum([
  'forex',
  'commodities',
  'indices',
  'synthetic',
  'stocks',
]);

export const productStatusSchema = z.enum(['active', 'inactive']);

export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .regex(/^[A-Z]+$/, 'Symbol must be uppercase letters'),
  category: productCategorySchema,
  status: productStatusSchema.default('active'),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional(),
});

export const createProductSchema = productSchema;
export const updateProductSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
```

### 5.3 Plan Schema

```typescript
export const planStatusSchema = z.enum(['active', 'inactive', 'deprecated']);

export const planSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  price: z
    .number()
    .positive('Price must be positive')
    .multipleOf(0.01, 'Price must have at most 2 decimal places'),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters')
    .default('USD'),
  billingPeriod: z.enum(['monthly', 'yearly']),
  features: z
    .array(z.string())
    .min(1, 'At least one feature is required'),
  status: planStatusSchema.default('active'),
  maxTrades: z
    .number()
    .int()
    .positive()
    .optional(),
  maxPositions: z
    .number()
    .int()
    .positive()
    .optional(),
});

export const createPlanSchema = planSchema;
export const updatePlanSchema = planSchema.partial();

export type PlanInput = z.infer<typeof planSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
```

---

## 6. API Route Schemas

### 6.1 Pagination Schema

```typescript
// libs/shared/schemas/src/lib/common.ts
export const paginationSchema = z.object({
  page: z
    .number()
    .int('Page must be an integer')
    .positive('Page must be positive')
    .default(1),
  limit: z
    .number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Maximum limit is 100')
    .default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
```

### 6.2 API Response Schema

```typescript
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    meta: z.object({
      total: z.number().int().optional(),
      page: z.number().int().optional(),
      limit: z.number().int().optional(),
    }).optional(),
  });

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
};
```

### 6.3 Error Response Schema

```typescript
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
```

---

## 7. WebSocket Message Schemas

### 7.1 Deriv API Request Schemas

```typescript
// libs/shared/schemas/src/lib/deriv.ts
export const derivAuthorizeSchema = z.object({
  authorize: z.string().min(1, 'API token is required'),
});

export const derivBuySchema = z.object({
  buy: z.literal(1),
  price: z.number().positive(),
  parameters: z.object({
    amount: z.number().positive(),
    basis: z.enum(['stake', 'payout']),
    contract_type: contractTypeSchema,
    currency: z.string().length(3).default('USD'),
    duration: z.number().int().positive(),
    duration_unit: durationUnitSchema,
    symbol: z.string().min(1),
  }),
});

export const derivSellSchema = z.object({
  sell: z.string().min(1, 'Contract ID is required'),
  price: z.number().positive(),
});

export const derivTicksSchema = z.object({
  ticks: z.string().min(1, 'Symbol is required'),
  subscribe: z.literal(1).optional(),
});
```

### 7.2 Deriv API Response Schemas

```typescript
export const derivTickResponseSchema = z.object({
  msg_type: z.literal('tick'),
  tick: z.object({
    symbol: z.string(),
    quote: z.number(),
    bid: z.number(),
    ask: z.number(),
    epoch: z.number(),
  }),
});

export const derivBuyResponseSchema = z.object({
  msg_type: z.literal('buy'),
  buy: z.object({
    contract_id: z.string(),
    price: z.number(),
    payout: z.number(),
    longcode: z.string(),
  }),
});

export const derivErrorResponseSchema = z.object({
  msg_type: z.string(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
```

---

## 8. Form Validation Utilities

### 8.1 React Hook Form Integration

```typescript
// libs/shared/schemas/src/lib/resolvers.ts
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

export function createFormResolver<T extends ZodSchema>(schema: T) {
  return zodResolver(schema);
}

// Usage in components
import { useForm } from 'react-hook-form';
import { loginSchema, LoginInput } from '@org/schemas';
import { createFormResolver } from '@org/schemas/resolvers';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: createFormResolver(loginSchema)
  });

  // ...
}
```

### 8.2 Validation Error Formatting

```typescript
// libs/shared/schemas/src/lib/formatting.ts
import { ZodError } from 'zod';

export interface FormattedError {
  field: string;
  message: string;
}

export function formatZodErrors(error: ZodError): FormattedError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

export function getFirstError(errors: FormattedError[]): string | null {
  return errors[0]?.message ?? null;
}
```

---

## 9. API Route Validation

### 9.1 Next.js Route Handler

```typescript
// libs/shared/schemas/src/lib/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: NextRequest): Promise<T | NextResponse> => {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: formatZodErrors(error),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Invalid JSON' },
        { status: 400 }
      );
    }
  };
}

// Usage in API route
import { buyContractSchema } from '@org/schemas';

export async function POST(request: NextRequest) {
  const body = await validateBody(buyContractSchema)(request);

  if (body instanceof NextResponse) {
    return body; // Return validation error
  }

  // body is typed as BuyContractInput
  const result = await tradingService.buyContract(body);
  return NextResponse.json({ success: true, data: result });
}
```

### 9.2 Query Parameter Validation

```typescript
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (request: NextRequest): T | NextResponse => {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());

    // Convert string numbers to actual numbers
    const parsed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(query)) {
      const num = Number(value);
      parsed[key] = isNaN(num) ? value : num;
    }

    try {
      return schema.parse(parsed);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid query parameters',
            details: formatZodErrors(error),
          },
          { status: 400 }
        );
      }
      throw error;
    }
  };
}
```

---

## 10. Schema Exports

```typescript
// libs/shared/schemas/src/index.ts
// Auth schemas
export * from './lib/auth';

// Profile schemas
export * from './lib/profile';

// Trading schemas
export * from './lib/trading';

// Admin schemas
export * from './lib/admin';

// Common schemas
export * from './lib/common';

// Deriv schemas
export * from './lib/deriv';

// Utilities
export * from './lib/resolvers';
export * from './lib/formatting';
export * from './lib/middleware';
```

---

*End of Validation Rules Layer Specification*
