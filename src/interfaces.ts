export interface User {
  id: string;
  email?: string;
}

export interface SendRequest {
  notificationId: string;
  user: User;
  mergeTags?: Record<string, unknown>;
  options?: {
    email?: {
      replyToAddresses?: string[];
      ccAddresses?: string[];
      bccAddresses?: string[];
    };
  };
}
