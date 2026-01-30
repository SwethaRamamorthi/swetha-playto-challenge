from django.contrib import admin
from .models import User, Post, Comment, Like, KarmaTransaction


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'total_karma', 'is_staff']
    search_fields = ['username', 'email']
    readonly_fields = ['total_karma', 'date_joined']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'content_preview', 'like_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username']
    readonly_fields = ['like_count', 'created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'post', 'parent', 'content_preview', 'like_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__username']
    readonly_fields = ['like_count', 'created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'content_type', 'object_id', 'created_at']
    list_filter = ['content_type', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']


@admin.register(KarmaTransaction)
class KarmaTransactionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'source_type', 'source_id', 'created_at']
    list_filter = ['source_type', 'created_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at']
