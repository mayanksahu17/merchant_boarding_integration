export interface Plan {
  agent: string | null;
  planId: number;
  planName: string;
  isValidPlan: boolean;
  isSystemPlan: boolean;
  isFavoritePlan: boolean;
  lastUpdatedAt: string;
}

export interface EmailHistoryItem {
  type: string;
  sentAt: string;
  recipient: string;
  success: boolean;
  error?: string;
  previousStatus?: string;
  newStatus?: string;
}

export interface Application {
  applicationName: string;
  externalKey: string;
  planId: number;
  email?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  emailsSent: Record<string, boolean>;
  emailHistory: EmailHistoryItem[];
  response?: any;
}
