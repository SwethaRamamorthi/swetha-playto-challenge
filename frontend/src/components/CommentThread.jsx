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
        const indentClass = depth > 0 ? 'ml-8 border-l-4 border-gradient-to-b from-purple-200 to-pink-200 pl-6' : '';

        return (
            <div key={comment.id} className={`${indentClass} mb-4`}>
                <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 backdrop-blur-sm rounded-2xl p-6 hover:from-purple-100/50 hover:to-pink-100/50 transition-all duration-300 border-2 border-purple-100 shadow-md hover:shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center text-white font-bold text-lg shadow-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
                            <span className="relative z-10">{comment.author.username[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-bold text-lg text-slate-800">{comment.author.username}</span>
                                <span className="text-xs text-slate-500 font-semibold px-3 py-1 bg-white/60 rounded-lg">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-slate-700 mb-4 leading-relaxed">{comment.content}</p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleLike(comment.id)}
                                    disabled={likingComments.has(comment.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 ${comment.is_liked
                                            ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-md'
                                            : 'bg-white/80 text-slate-600 hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100'
                                        }`}
                                >
                                    <span className="text-lg">{comment.is_liked ? '❤️' : '🤍'}</span>
                                    <span>{comment.like_count}</span>
                                </button>
                                {depth < maxDepth && (
                                    <button
                                        onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                                        className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-purple-600 hover:from-blue-200 hover:to-purple-200 transition-all duration-300 transform hover:scale-110 shadow-md"
                                    >
                                        {isReplying ? '✖️ Cancel' : '💬 Reply'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isReplying && (
                    <div className="mt-4 ml-16 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
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
                    <div className="mt-4">
                        {comment.replies.map((reply) => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {comments.map((comment) => renderComment(comment))}
        </div>
    );
}
