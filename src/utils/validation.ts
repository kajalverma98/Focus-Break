import { z } from 'zod';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]*$/;

/** Lower-cases emails and strips spaces / country code from Indian mobile numbers. */
export function normalizeIdentifier(value: string): string {
  const v = value.trim();
  if (v.includes('@')) return v.toLowerCase();
  return v
    .replace(/[\s-]/g, '')
    .replace(/^\+?91(?=\d{10}$)/, '')
    .replace(/^0(?=\d{10}$)/, '');
}

export const identifierSchema = z
  .string()
  .trim()
  .min(1, 'Email or mobile number is required')
  .refine((v) => {
    const n = normalizeIdentifier(v);
    return EMAIL_REGEX.test(n) || MOBILE_REGEX.test(n);
  }, 'Enter a valid email or 10-digit mobile number');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Add at least one uppercase letter')
  .regex(/[a-z]/, 'Add at least one lowercase letter')
  .regex(/\d/, 'Add at least one number');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name is too long')
  .regex(NAME_REGEX, 'Name can only contain letters');

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: nameSchema,
    identifier: identifierSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterForm = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  identifier: identifierSchema,
});
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const editProfileSchema = z.object({
  fullName: nameSchema,
  tagline: z.string().trim().max(60, 'Keep it under 60 characters'),
});
export type EditProfileForm = z.infer<typeof editProfileSchema>;

export const workSetupSchema = z
  .object({
    workHours: z.number().min(1, 'Pick at least 1 hour').max(12, 'Maximum is 12 hours'),
    focusMinutes: z.number().min(5, 'Focus must be at least 5 minutes'),
    breakMinutes: z.number().min(1, 'Break must be at least 1 minute'),
    longBreakMinutes: z.number().min(1),
  })
  .superRefine((v, ctx) => {
    if (v.breakMinutes >= v.focusMinutes) {
      ctx.addIssue({
        code: 'custom',
        path: ['breakMinutes'],
        message: 'Break must be shorter than the focus duration',
      });
    }
    if (v.focusMinutes > v.workHours * 60) {
      ctx.addIssue({
        code: 'custom',
        path: ['focusMinutes'],
        message: 'Focus duration cannot be longer than your total work time',
      });
    }
    if (v.longBreakMinutes < v.breakMinutes) {
      ctx.addIssue({
        code: 'custom',
        path: ['longBreakMinutes'],
        message: 'Long break should be at least as long as a short break',
      });
    }
  });
export type WorkSetupForm = z.infer<typeof workSetupSchema>;

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}

export function getPasswordStrength(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score: score as PasswordStrength['score'], label: labels[score] };
}
