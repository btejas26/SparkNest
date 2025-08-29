import bcrypt from "bcryptjs";
import { storage } from "../storage";
import { sendOTPEmail } from "./email";
import { generateToken } from "../middleware/auth";

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createUserWithOTP(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, message: "User with this email already exists" };
    }

    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await storage.createOTP({
      email: userData.email,
      code: otp,
      expiresAt,
    });

    await sendOTPEmail(userData.email, otp);

    return { success: true, message: "OTP sent to your email" };
  } catch (error) {
    console.error("Error creating user with OTP:", error);
    return { success: false, message: "Failed to send OTP" };
  }
}

export async function verifyOTPAndCreateUser(
  email: string,
  otp: string,
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
  try {
    // Verify OTP
    const validOTP = await storage.getValidOTP(email, otp);
    if (!validOTP) {
      return { success: false, message: "Invalid or expired OTP" };
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(userData.password);
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });
    
    // Update email verification status
    await storage.updateUserEmailVerification(userData.email, true);

    // Mark OTP as used
    await storage.markOTPAsUsed(validOTP.id);

    // Generate JWT token
    const token = generateToken(user.id);

    return {
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  } catch (error) {
    console.error("Error verifying OTP and creating user:", error);
    return { success: false, message: "Failed to create account" };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; token?: string; user?: any }> {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user || !user.password) {
      return { success: false, message: "Invalid email or password" };
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return { success: false, message: "Invalid email or password" };
    }

    if (!user.isEmailVerified) {
      return { success: false, message: "Please verify your email first" };
    }

    const token = generateToken(user.id);

    return {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    return { success: false, message: "Login failed" };
  }
}
