export type HardwareTier = 'STANDARD' | 'PREMIUM';

export type OnboardingStatus =
  | 'MANAGER_REVIEW'
  | 'FINANCE_APPROVAL'
  | 'IT_PROVISIONING'
  | 'NEEDS_REWORK'
  | 'COMPLETED';

export interface OnboardingRequest {
  id: number;
  employeeName: string;
  employeeRole: string;
  startDate: string;
  hardwareTier: HardwareTier;
  status: OnboardingStatus;
  jobDescription: string;

  rejectionReason?: string | null;

  companyEmail?: string | null;
  laptopConfiguration?: string | null;

  approvedBudget?: number | null;
  financeNotes?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateOnboardingRequest {
  employeeName: string;
  employeeRole: string;
  startDate: string;
  hardwareTier: HardwareTier;
  jobDescription: string;
}

export type UpdateOnboardingRequest = CreateOnboardingRequest;

export interface RejectRequest {
  rejectionReason: string;
}

export interface ITProvisioningRequest {
  companyEmail: string;
  laptopConfiguration: string;
}

export interface FinanceApprovalRequest {
  approvedBudget: number;
  financeNotes: string;
}