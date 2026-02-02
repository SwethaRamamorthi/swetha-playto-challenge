import { useState, useEffect } from 'react';
import { postsAPI, commentsAPI } from '../api';
import CommentThread from './CommentThread';

export default function Feed() {
    const [posts, setPosts] = useState([]);
    const [expandedPost, setExpandedPost] = useState(null);
    const [newPostContent, setNewPostContent] = useState('');
    const [newCommentContent, setNewCommentContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [likingPosts, setLikingPosts] = useState(new Set());

    const fetchPosts = async () => {
        try {
            const response = await postsAPI.getAll();
            setPosts(response.data.results || response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setLoading(false);
        }
    };

    const fetchPostDetail = async (postId) => {
        try {
            const response = await postsAPI.getById(postId);
            setExpandedPost(response.data);
        } catch (error) {
            console.error('Error fetching post detail:', error);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        try {
            await postsAPI.create(newPostContent);
            setNewPostContent('');
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Please login to create posts');
        }
    };

    const handleLikePost = async (postId) => {
        if (likingPosts.has(postId)) return;

        setLikingPosts(new Set(likingPosts).add(postId));
        try {
            await postsAPI.like(postId);
            fetchPosts();
            if (expandedPost && expandedPost.id === postId) {
                fetchPostDetail(postId);
            }
        } catch (error) {
            console.error('Error liking post:', error);
            alert('Please login to like');
        } finally {
            setLikingPosts((prev) => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        }
    };

    const handleExpandPost = (postId) => {
        if (expandedPost && expandedPost.id === postId) {
            setExpandedPost(null);
        } else {
            fetchPostDetail(postId);
        }
    };

    const handleAddComment = async (postId) => {
        if (!newCommentContent.trim()) return;

        try {
            await commentsAPI.create(postId, newCommentContent);
            setNewCommentContent('');
            fetchPostDetail(postId);
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Please login to comment');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Create Post Form */}
            <div className="card p-6 hover-lift">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>✨</span>
                    Create a Post
                </h2>
                <form onSubmit={handleCreatePost}>
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="What's on your mind? Share something amazing..."
                        className="input-field resize-none"
                        rows="4"
                    />
                    <button type="submit" className="btn-primary mt-3">
                        <span className="flex items-center gap-2">
                            <span>🚀</span>
                            <span>Post</span>
                        </span>
                    </button>
                </form>
            </div>

            {/* Posts Feed */}
            {posts.map((post) => {
                const isExpanded = expandedPost && expandedPost.id === post.id;
                const displayPost = isExpanded ? expandedPost : post;

                return (
                    <div key={post.id} className="card p-6 hover-lift">
                        {/* Post Header */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="avatar w-12 h-12 text-lg">
                                {displayPost.author.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{displayPost.author.username}</div>
                                <div className="text-sm text-gray-500">
                                    {new Date(displayPost.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="badge bg-yellow-100 text-yellow-700 border border-yellow-200">
                                <span>⭐</span>
                                <span>{displayPost.author.total_karma}</span>
                            </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-gray-700 mb-4 leading-relaxed">{displayPost.content}</p>

                        {/* Post Actions */}
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <button
                                onClick={() => handleLikePost(displayPost.id)}
                                disabled={likingPosts.has(displayPost.id)}
                                className={`action-btn ${displayPost.is_liked
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                    }`}
                            >
                                <span>{displayPost.is_liked ? '❤️' : '🤍'}</span>
                                <span>{displayPost.like_count}</span>
                            </button>
                            <button
                                onClick={() => handleExpandPost(displayPost.id)}
                                className="action-btn bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                            >
                                <span>💬</span>
                                <span>{displayPost.comment_count || 0}</span>
                            </button>
                        </div>

                        {/* Comments Section */}
                        {isExpanded && (
                            <div className="space-y-4 mt-4">
                                {/* Add Comment Form */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <textarea
                                        value={newCommentContent}
                                        onChange={(e) => setNewCommentContent(e.target.value)}
                                        placeholder="Share your thoughts..."
                                        className="input-field resize-none"
                                        rows="3"
                                    />
                                    <button
                                        onClick={() => handleAddComment(displayPost.id)}
                                        className="btn-primary mt-3"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>💭</span>
                                            <span>Comment</span>
                                        </span>
                                    </button>
                                </div>

                                {/* Comment Thread */}
                                {displayPost.comments && displayPost.comments.length > 0 ? (
                                    <CommentThread
                                        comments={displayPost.comments}
                                        postId={displayPost.id}
                                        onCommentAdded={() => fetchPostDetail(displayPost.id)}
                                    />
                                ) : (
                                    <p className="text-center py-6 text-gray-500">
                                        No comments yet. Be the first to share your thoughts! 💭
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
