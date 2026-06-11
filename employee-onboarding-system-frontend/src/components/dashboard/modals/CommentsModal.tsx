import type { OnboardingRequest } from '../../../types/onboarding';
import type { OnboardingComment } from '../../../types/comment';

type Props = {
  request: OnboardingRequest;
  comments: OnboardingComment[];
  commentText: string;
  loading: boolean;
  onCommentTextChange: (value: string) => void;
  onAddComment: () => void;
  onClose: () => void;
};

function CommentsModal({
  request,
  comments,
  commentText,
  loading,
  onCommentTextChange,
  onAddComment,
  onClose,
}: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal-card comments-modal-card">
        <h2>Request Comments</h2>
        <p>
          Discussion for <strong>{request.employeeName}</strong>
        </p>

        <div className="comment-input-section">
          <textarea
            placeholder="Write a comment..."
            value={commentText}
            onChange={(event) => onCommentTextChange(event.target.value)}
          />

          <button className="primary-button" onClick={onAddComment}>
            Add Comment
          </button>
        </div>

        {loading && <p className="dashboard-message">Loading comments...</p>}

        {!loading && comments.length === 0 && (
          <p className="no-actions-label">No comments yet.</p>
        )}

        {!loading && comments.length > 0 && (
          <div className="comments-list">
            {comments.map((comment) => (
              <div className="comment-item" key={comment.id}>
                <div className="comment-header">
                  <strong>{comment.authorName}</strong>
                  <span className={`role-badge role-${comment.authorRole.toLowerCase()}`}>
                    {comment.authorRole}
                  </span>
                </div>

                <p>{comment.commentText}</p>

                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentsModal;