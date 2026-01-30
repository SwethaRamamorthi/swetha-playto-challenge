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
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card card-glossy p-8 animate-pulse">
                        <div className="h-6 bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl w-1/4 mb-6"></div>
                        <div className="h-24 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Create Post Form */}
            <div className="card card-glossy p-8 transform hover:scale-[1.02] transition-transform duration-300">
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-2">
                    <span className="text-3xl">✨</span>
                    Create a Post
                </h2>
                <form onSubmit={handleCreatePost}>
                    <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="What's on your mind? Share something amazing..."
                        className="input-field resize-none text-lg"
                        rows="4"
                    />
                    <button type="submit" className="btn-primary mt-4 w-full sm:w-auto">
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
                    <div key={post.id} className="card card-glossy p-8 transform hover:scale-[1.01] transition-all duration-300">
                        {/* Post Header */}
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center text-white font-bold text-2xl shadow-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
                                <span className="relative z-10">{displayPost.author.username[0].toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-xl text-slate-800">{displayPost.author.username}</div>
                                <div className="text-sm text-slate-500 font-medium">
                                    {new Date(displayPost.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-200 shadow-md">
                                <span className="text-orange-600 font-bold flex items-center gap-1">
                                    <span>⭐</span>
                                    <span>{displayPost.author.total_karma}</span>
                                </span>
                            </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-slate-700 mb-6 text-lg leading-relaxed">{displayPost.content}</p>

                        {/* Post Actions */}
                        <div className="flex items-center gap-6 mb-6 pb-6 border-b-2 border-gradient-to-r from-purple-100 to-pink-100">
                            <button
                                onClick={() => handleLikePost(displayPost.id)}
                                disabled={likingPosts.has(displayPost.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-110 ${displayPost.is_liked
                                        ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-lg'
                                        : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 hover:from-red-100 hover:to-pink-100'
                                    }`}
                            >
                                <span className="text-2xl">{displayPost.is_liked ? '❤️' : '🤍'}</span>
                                <span className="text-lg">{displayPost.like_count}</span>
                            </button>
                            <button
                                onClick={() => handleExpandPost(displayPost.id)}
                                className="flex items-center gap-3 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-purple-600 hover:from-blue-200 hover:to-purple-200 transition-all duration-300 transform hover:scale-110 shadow-md"
                            >
                                <span className="text-2xl">💬</span>
                                <span className="text-lg">{displayPost.comment_count || 0}</span>
                            </button>
                        </div>

                        {/* Comments Section */}
                        {isExpanded && (
                            <div className="space-y-6 mt-6">
                                {/* Add Comment Form */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                                    <textarea
                                        value={newCommentContent}
                                        onChange={(e) => setNewCommentContent(e.target.value)}
                                        placeholder="Share your thoughts..."
                                        className="input-field resize-none"
                                        rows="3"
                                    />
                                    <button
                                        onClick={() => handleAddComment(displayPost.id)}
                                        className="btn-primary mt-4"
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
                                    <p className="text-center py-8 text-slate-500 text-lg">
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
