import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from 'jsonwebtoken';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function verifyJwtToken(token: string): Promise<boolean> {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return !!decoded;
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return false;
  }
}
