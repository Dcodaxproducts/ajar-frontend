import { ReactNode } from "react";

export interface AuthLayoutProps {
  FormComponent: ReactNode,
  isVerfication?: boolean
}

export interface AuthButtonProps {
  text: string
  className?: string
  isPending?: boolean
}

export interface FooterProps {
  messageText?: string;
  linkHref: string;
  linkText: string;
  className?: string;
};

export interface HeaderProps {
  title: string,
  description?: string
  className?: string
}

export interface LogoutButtonProps {
  variant?: "menu" | "full";
  isPending?: boolean;
}

export type EditProfile = {
  name: string;
  dob: string;
  nationality: string;
};

export interface LoginSuccessResponse {
  user: {
    otp: {
      isVerified: false;
    }
    email: string;
  }
  require2FA?: boolean;
  message?: string;
  tempToken?: string;
  token?: string;
}

export interface TwoFactorParams {
  token: string;
  authToken?: string;
}
