from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from feed.models import User, Post, Comment, Like, KarmaTransaction


class Command(BaseCommand):
    help = 'Populate database with sample data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # Create users
        users = []
        for i in range(1, 6):
            user, created = User.objects.get_or_create(
                username=f'user{i}',
                defaults={
                    'email': f'user{i}@example.com',
                    'first_name': f'User',
                    'last_name': f'{i}'
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            users.append(user)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(users)} users'))
        
        # Create posts
        posts = []
        post_contents = [
            "Just discovered this amazing community! Excited to be here! 🎉",
            "What are your thoughts on the latest tech trends? Let's discuss!",
            "Built my first full-stack app today. Feeling accomplished! 💪",
            "Looking for recommendations on learning resources for Django.",
            "Anyone else working on interesting side projects? Share below!",
        ]
        
        for i, content in enumerate(post_contents):
            post = Post.objects.create(
                author=users[i % len(users)],
                content=content
            )
            posts.append(post)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(posts)} posts'))
        
        # Create comments (including nested ones)
        comments = []
        comment_data = [
            (posts[0], None, users[1], "Welcome! This community is great!"),
            (posts[0], None, users[2], "Glad to have you here!"),
            (posts[1], None, users[0], "AI is definitely the hottest topic right now."),
            (posts[1], None, users[3], "I'm more interested in web3 technologies."),
            (posts[2], None, users[4], "Congratulations! What stack did you use?"),
            (posts[3], None, users[1], "I highly recommend the official Django docs."),
            (posts[3], None, users[2], "Also check out Django for Beginners book!"),
            (posts[4], None, users[0], "I'm building a task management app!"),
        ]
        
        for post, parent, author, content in comment_data:
            comment = Comment.objects.create(
                post=post,
                parent=parent,
                author=author,
                content=content
            )
            comments.append(comment)
        
        # Create nested replies
        nested_replies = [
            (comments[0], users[0], "Thanks! Looking forward to connecting!"),
            (comments[2], users[1], "Absolutely! The AI revolution is here."),
            (comments[4], users[2], "I used Django + React with PostgreSQL."),
            (comments[7], users[1], "That sounds interesting! What features?"),
        ]
        
        for parent_comment, author, content in nested_replies:
            comment = Comment.objects.create(
                post=parent_comment.post,
                parent=parent_comment,
                author=author,
                content=content
            )
            comments.append(comment)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(comments)} comments'))
        
        # Create likes and karma transactions
        # Mix of recent (last 24h) and older likes
        now = timezone.now()
        
        # Recent likes (for leaderboard)
        recent_likes = [
            (posts[0], users[1], now - timedelta(hours=2)),
            (posts[0], users[2], now - timedelta(hours=5)),
            (posts[1], users[0], now - timedelta(hours=1)),
            (posts[2], users[3], now - timedelta(hours=10)),
            (comments[0], users[0], now - timedelta(hours=3)),
            (comments[2], users[2], now - timedelta(hours=8)),
        ]
        
        for obj, user, created_at in recent_likes:
            content_type = 'post' if isinstance(obj, Post) else 'comment'
            like = Like.objects.create(
                user=user,
                content_type=content_type,
                object_id=obj.id
            )
            like.created_at = created_at
            like.save()
            
            # Update like count
            if isinstance(obj, Post):
                obj.like_count += 1
                obj.save()
                karma_amount = 5
                source_type = 'post_like'
            else:
                obj.like_count += 1
                obj.save()
                karma_amount = 1
                source_type = 'comment_like'
            
            # Create karma transaction
            karma = KarmaTransaction.objects.create(
                user=obj.author,
                amount=karma_amount,
                source_type=source_type,
                source_id=obj.id
            )
            karma.created_at = created_at
            karma.save()
            
            # Update total karma
            obj.author.total_karma += karma_amount
            obj.author.save()
        
        # Older likes (not in leaderboard)
        old_likes = [
            (posts[3], users[2], now - timedelta(days=2)),
            (posts[4], users[1], now - timedelta(days=3)),
        ]
        
        for obj, user, created_at in old_likes:
            content_type = 'post' if isinstance(obj, Post) else 'comment'
            like = Like.objects.create(
                user=user,
                content_type=content_type,
                object_id=obj.id
            )
            like.created_at = created_at
            like.save()
            
            # Update like count
            if isinstance(obj, Post):
                obj.like_count += 1
                obj.save()
                karma_amount = 5
                source_type = 'post_like'
            else:
                obj.like_count += 1
                obj.save()
                karma_amount = 1
                source_type = 'comment_like'
            
            # Create karma transaction
            karma = KarmaTransaction.objects.create(
                user=obj.author,
                amount=karma_amount,
                source_type=source_type,
                source_id=obj.id
            )
            karma.created_at = created_at
            karma.save()
            
            # Update total karma
            obj.author.total_karma += karma_amount
            obj.author.save()
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write(self.style.WARNING('\nTest users (password: password123):'))
        for user in users:
            self.stdout.write(f'  - {user.username}')
