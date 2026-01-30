from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models import F
from django.utils import timezone


class User(AbstractUser):
    """Extended user model with karma tracking."""
    total_karma = models.IntegerField(default=0)
    
    def __str__(self):
        return self.username


class Post(models.Model):
    """Post model with denormalized like count for performance."""
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    like_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Post by {self.author.username} at {self.created_at}"


class Comment(models.Model):
    """Threaded comment model using adjacency list pattern."""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    like_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post}"


class Like(models.Model):
    """Like model with unique constraint to prevent double-likes."""
    CONTENT_TYPES = [
        ('post', 'Post'),
        ('comment', 'Comment'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPES)
    object_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'content_type', 'object_id']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]
    
    def __str__(self):
        return f"{self.user.username} liked {self.content_type} {self.object_id}"


class KarmaTransaction(models.Model):
    """Karma transaction model for tracking all karma events with timestamps."""
    SOURCE_TYPES = [
        ('post_like', 'Post Like'),
        ('comment_like', 'Comment Like'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='karma_transactions')
    amount = models.IntegerField()  # 5 for post likes, 1 for comment likes
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    source_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} earned {self.amount} karma from {self.source_type}"
