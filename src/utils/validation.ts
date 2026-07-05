export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
}

export interface RegisterFormErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function validateRegisterForm(
  displayName: string,
  email: string,
  password: string,
  confirmPassword: string
): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!displayName.trim()) {
    errors.displayName = 'Name is required.';
  }

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email.';
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export function validateLoginForm(email: string, password: string): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return errors;
}
import { TaskFormData } from '../types/task';

export interface TaskFormErrors {
  title?: string;
}

export function validateTaskForm(form: TaskFormData): TaskFormErrors {
  const errors: TaskFormErrors = {};
  if (!form.title.trim()) {
    errors.title = 'Title is required.';
  }
  return errors;
}
import { RewardFormData } from '../types/reward';

export interface RewardFormErrors {
  title?: string;
  cost?: string;
}

export function validateRewardForm(form: RewardFormData): RewardFormErrors {
  const errors: RewardFormErrors = {};
  if (!form.title.trim()) {
    errors.title = 'Title is required.';
  }
  if (!Number.isFinite(form.cost) || form.cost <= 0) {
    errors.cost = 'Cost must be a positive number.';
  }
  return errors;
}