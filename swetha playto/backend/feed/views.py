from django.db import transaction
from django.db.models import Count, Sum, Prefetch, Q, F
from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly

from .models import Post, Comment, Like, KarmaTransaction, User
from .serializers import (
    PostSerializer, PostDetailSerializer, PostCreateSerializer,
    CommentSerializer, CommentCreateSerializer,
    LeaderboardSerializer
)


class PostViewSet(viewsets.ModelViewSet):
    """ViewSet for posts with optimized queries."""
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        elif self.action == 'retrieve':
            return PostDetailSerializer
        return PostSerializer
    
    def get_queryset(self):
        """Optimize queries to prevent N+1."""
        queryset = Post.objects.select_related('author').all()
        
        if self.action == 'list':
            # For list view, just annotate comment count
            queryset = queryset.annotate(comment_count_annotated=Count('comments'))
        elif self.action == 'retrieve':
            # For detail view, prefetch entire comment tree
            # This is the key to preventing N+1 queries!
            
            # Create a recursive prefetch for nested comments
            def get_comment_prefetch(depth=0, max_depth=10):
                """Recursively build prefetch objects for nested comments."""
                if depth >= max_depth:
                    return Prefetch(
                        'replies',
                        queryset=Comment.objects.select_related('author').all(),
                        to_attr='prefetched_replies'
                    )
                
                return Prefetch(
                    'replies',
                    queryset=Comment.objects.select_related('author').prefetch_related(
                        get_comment_prefetch(depth + 1, max_depth)
                    ).all(),
                    to_attr='prefetched_replies'
                )
            
            # Prefetch all comments with their nested replies
            comments_prefetch = Prefetch(
                'comments',
                queryset=Comment.objects.select_related('author').prefetch_related(
                    get_comment_prefetch()
                ).all(),
                to_attr='prefetched_comments'
            )
            
            queryset = queryset.prefetch_related(comments_prefetch)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Toggle like on a post with race condition protection."""
        post = self.get_object()
        user = request.user
        
        # Use select_for_update to prevent race conditions
        with transaction.atomic():
            # Lock the post row
            post = Post.objects.select_for_update().get(pk=pk)
            
            # Check if like exists
            like_obj = Like.objects.filter(
                user=user,
                content_type='post',
                object_id=post.id
            ).first()
            
            if like_obj:
                # Unlike: remove like and karma transaction
                like_obj.delete()
                post.like_count = F('like_count') - 1
                post.save(update_fields=['like_count'])
                
                # Remove karma transaction
                KarmaTransaction.objects.filter(
                    user=post.author,
                    source_type='post_like',
                    source_id=post.id
                ).delete()
                
                # Update author's total karma
                post.author.total_karma = F('total_karma') - 5
                post.author.save(update_fields=['total_karma'])
                
                post.refresh_from_db()
                return Response({
                    'liked': False,
                    'like_count': post.like_count
                })
            else:
                # Like: create like and karma transaction
                Like.objects.create(
                    user=user,
                    content_type='post',
                    object_id=post.id
                )
                
                post.like_count = F('like_count') + 1
                post.save(update_fields=['like_count'])
                
                # Create karma transaction (5 points for post like)
                KarmaTransaction.objects.create(
                    user=post.author,
                    amount=5,
                    source_type='post_like',
                    source_id=post.id
                )
                
                # Update author's total karma
                post.author.total_karma = F('total_karma') + 5
                post.author.save(update_fields=['total_karma'])
                
                post.refresh_from_db()
                return Response({
                    'liked': True,
                    'like_count': post.like_count
                })


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for comments."""
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Comment.objects.select_related('author', 'post').all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Toggle like on a comment with race condition protection."""
        comment = self.get_object()
        user = request.user
        
        # Use select_for_update to prevent race conditions
        with transaction.atomic():
            # Lock the comment row
            comment = Comment.objects.select_for_update().get(pk=pk)
            
            # Check if like exists
            like_obj = Like.objects.filter(
                user=user,
                content_type='comment',
                object_id=comment.id
            ).first()
            
            if like_obj:
                # Unlike: remove like and karma transaction
                like_obj.delete()
                comment.like_count = F('like_count') - 1
                comment.save(update_fields=['like_count'])
                
                # Remove karma transaction
                KarmaTransaction.objects.filter(
                    user=comment.author,
                    source_type='comment_like',
                    source_id=comment.id
                ).delete()
                
                # Update author's total karma
                comment.author.total_karma = F('total_karma') - 1
                comment.author.save(update_fields=['total_karma'])
                
                comment.refresh_from_db()
                return Response({
                    'liked': False,
                    'like_count': comment.like_count
                })
            else:
                # Like: create like and karma transaction
                Like.objects.create(
                    user=user,
                    content_type='comment',
                    object_id=comment.id
                )
                
                comment.like_count = F('like_count') + 1
                comment.save(update_fields=['like_count'])
                
                # Create karma transaction (1 point for comment like)
                KarmaTransaction.objects.create(
                    user=comment.author,
                    amount=1,
                    source_type='comment_like',
                    source_id=comment.id
                )
                
                # Update author's total karma
                comment.author.total_karma = F('total_karma') + 1
                comment.author.save(update_fields=['total_karma'])
                
                comment.refresh_from_db()
                return Response({
                    'liked': True,
                    'like_count': comment.like_count
                })


@api_view(['GET'])
def leaderboard(request):
    """
    Get top 5 users by karma earned in the last 24 hours.
    
    This is the critical aggregation query that calculates karma dynamically
    from the transaction history, not from a simple integer field.
    """
    # Calculate 24 hours ago
    twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
    
    # Aggregate karma from transactions in the last 24 hours
    # This is the key query that satisfies the "Complex Aggregation" constraint
    leaderboard_data = (
        KarmaTransaction.objects
        .filter(created_at__gte=twenty_four_hours_ago)
        .values('user__id', 'user__username')
        .annotate(karma_24h=Sum('amount'))
        .order_by('-karma_24h')[:5]
    )
    
    # Add rank to each entry
    ranked_data = []
    for rank, entry in enumerate(leaderboard_data, start=1):
        ranked_data.append({
            'user_id': entry['user__id'],
            'username': entry['user__username'],
            'karma_24h': entry['karma_24h'],
            'rank': rank
        })
    
    serializer = LeaderboardSerializer(ranked_data, many=True)
    return Response(serializer.data)
