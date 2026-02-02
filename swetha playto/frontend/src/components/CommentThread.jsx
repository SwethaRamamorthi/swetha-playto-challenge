import { useState } from 'react';
import { commentsAPI } from '../api';

export default function CommentThread({ comments, postId, onCommentAdded }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [likingComments, setLikingComments] = useState(new Set());

    const handleReply = async (parentId) => {
        if (!replyContent.trim()) return;

        try {
            await commentsAPI.create(postId, replyContent, parentId);
            setReplyContent('');
            setReplyingTo(null);
            onCommentAdded();
        } catch (error) {
            console.error('Error posting reply:', error);
            alert('Please login to reply');
        }
    };

    const handleLike = async (commentId) => {
        if (likingComments.has(commentId)) return;

        setLikingComments(new Set(likingComments).add(commentId));
        try {
            await commentsAPI.like(commentId);
            onCommentAdded();
        } catch (error) {
            console.error('Error liking comment:', error);
            alert('Please login to like');
        } finally {
            setLikingComments((prev) => {
                const next = new Set(prev);
                next.delete(commentId);
                return next;
            });
        }
    };

    const renderComment = (comment, depth = 0) => {
        const isReplying = replyingTo === comment.id;
        const maxDepth = 5;
        const indentClass = depth > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : '';

        return (
            <div key={comment.id} className={`${indentClass} mb-3`}>
                <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-start gap-3">
                        <div className="avatar w-10 h-10 text-sm flex-shrink-0">
                            {comment.author.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{comment.author.username}</span>
                                <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleLike(comment.id)}
                                    disabled={likingComments.has(comment.id)}
                                    className={`action-btn text-sm ${comment.is_liked
                                            ? 'bg-red-50 text-red-600 border border-red-200'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                        }`}
                                >
                                    <span className="text-base">{comment.is_liked ? '❤️' : '🤍'}</span>
                                    <span>{comment.like_count}</span>
                                </button>
                                {depth < maxDepth && (
                                    <button
                                        onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                                        className="action-btn text-sm bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                    >
                                        {isReplying ? '✖️ Cancel' : '💬 Reply'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isReplying && (
                    <div className="mt-3 ml-12 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write your reply..."
                            className="input-field resize-none"
                            rows="3"
                        />
                        <button
                            onClick={() => handleReply(comment.id)}
                            className="btn-primary mt-3"
                        >
                            <span className="flex items-center gap-2">
                                <span>📤</span>
                                <span>Post Reply</span>
                            </span>
                        </button>
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3">
                        {comment.replies.map((reply) => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-3">
            {comments.map((comment) => renderComment(comment))}
        </div>
    );
}
