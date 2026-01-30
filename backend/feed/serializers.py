from rest_framework import serializers
from .models import User, Post, Comment, Like, KarmaTransaction


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data."""
    class Meta:
        model = User
        fields = ['id', 'username', 'total_karma']


class RecursiveCommentSerializer(serializers.Serializer):
    """Recursive serializer for nested comment threads."""
    def to_representation(self, instance):
        serializer = CommentSerializer(instance, context=self.context)
        representation = serializer.data
        
        # Recursively serialize replies
        if hasattr(instance, 'prefetched_replies'):
            # Use prefetched data to avoid N+1
            representation['replies'] = RecursiveCommentSerializer(
                instance.prefetched_replies, 
                many=True, 
                context=self.context
            ).data
        else:
            representation['replies'] = []
        
        return representation


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for comments with author info."""
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'post', 'parent', 'author', 'content', 'created_at', 'like_count', 'replies', 'is_liked']
        read_only_fields = ['like_count', 'created_at']
    
    def get_replies(self, obj):
        """Get nested replies without N+1 queries."""
        # Only include replies for root-level comments in list view
        # Detail view will use RecursiveCommentSerializer
        return []
    
    def get_is_liked(self, obj):
        """Check if current user has liked this comment."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(
                user=request.user,
                content_type='comment',
                object_id=obj.id
            ).exists()
        return False


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments."""
    class Meta:
        model = Comment
        fields = ['post', 'parent', 'content']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class PostSerializer(serializers.ModelSerializer):
    """Serializer for posts with author info and comment count."""
    author = UserSerializer(read_only=True)
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'created_at', 'like_count', 'comment_count', 'is_liked']
        read_only_fields = ['like_count', 'created_at']
    
    def get_comment_count(self, obj):
        """Get total comment count."""
        if hasattr(obj, 'comment_count_annotated'):
            return obj.comment_count_annotated
        return obj.comments.count()
    
    def get_is_liked(self, obj):
        """Check if current user has liked this post."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(
                user=request.user,
                content_type='post',
                object_id=obj.id
            ).exists()
        return False


class PostDetailSerializer(PostSerializer):
    """Detailed post serializer with full comment tree."""
    comments = serializers.SerializerMethodField()
    
    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['comments']
    
    def get_comments(self, obj):
        """Get root-level comments with nested replies (optimized)."""
        # Get only root comments (no parent)
        root_comments = [c for c in obj.prefetched_comments if c.parent_id is None]
        return RecursiveCommentSerializer(root_comments, many=True, context=self.context).data


class PostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating posts."""
    class Meta:
        model = Post
        fields = ['content']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class LeaderboardSerializer(serializers.Serializer):
    """Serializer for leaderboard data."""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    karma_24h = serializers.IntegerField()
    rank = serializers.IntegerField()
