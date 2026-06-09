import type { UserRole } from './auth';

export interface OnboardingComment {
  id: number;
  requestId: number;
  authorName: string;
  authorEmail: string;
  authorRole: UserRole;
  commentText: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  commentText: string;
}