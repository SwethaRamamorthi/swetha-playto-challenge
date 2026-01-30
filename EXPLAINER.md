# Technical Deep Dive - Playto Community Feed

Hey! So I built this community feed app for the Playto challenge, and I wanted to walk you through some of the interesting technical problems I tackled. This doc covers the three main challenges from the requirements.

## The Comment Tree Problem

You know how Reddit has those nested comment threads that can go super deep? That's what I needed to build here. The tricky part is making it efficient - you don't want to hit the database 50 times just to load one post with comments.

### How I Modeled It

I went with the classic adjacency list pattern. Each comment has a `parent` field that points to another comment (or null if it's a top-level comment). Simple, right?

```python
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    # ... other fields
```

The beauty of this is that it's flexible - you can nest as deep as you want. The downside? If you're not careful, you'll end up with the dreaded N+1 query problem.

### Solving the N+1 Problem

Here's where it gets interesting. When you fetch a post, you need all its comments AND all the replies to those comments, AND all the replies to THOSE comments... you get the idea.

My first instinct was to just use `select_related` and call it a day. But that doesn't work for recursive relationships. So I built a recursive prefetch function:

```python
def get_comment_prefetch(depth=0, max_depth=10):
    if depth >= max_depth:
        return Prefetch(
            'replies',
            queryset=Comment.objects.select_related('author').prefetch_related('likes')
        )
    
    return Prefetch(
        'replies',
        queryset=Comment.objects.select_related('author')
            .prefetch_related('likes', get_comment_prefetch(depth + 1, max_depth))
    )
```

What this does is build up a chain of prefetch operations that Django can execute in a small number of queries. Instead of 50+ queries for a nested thread, we're down to about 3-5 queries total.

I tested this with Django Debug Toolbar and the difference is night and day. A post with 50 comments used to trigger 50+ database hits. Now it's just a handful.

## The 24-Hour Leaderboard

This one was fun. The requirement was to show the top users by karma earned in the last 24 hours. The catch? It needs to be dynamic - as time passes, old karma should "fall off" the leaderboard.

### Why Not Just Use a Counter?

My first thought was to just have a `karma_24h` field on the User model and update it whenever someone gets karma. But then I realized - how do you know when to decrement it? You'd need a background job running constantly to check which karma is older than 24 hours. That's messy.

### The Transaction Log Approach

Instead, I created a `KarmaTransaction` model that logs every karma event with a timestamp:

```python
class KarmaTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.IntegerField()
    reason = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
```

Now the leaderboard query is straightforward - just filter transactions from the last 24 hours and sum them up:

```python
from django.utils import timezone
from datetime import timedelta

twenty_four_hours_ago = timezone.now() - timedelta(hours=24)

leaders = KarmaTransaction.objects.filter(
    created_at__gte=twenty_four_hours_ago
).values('user__id', 'user__username').annotate(
    karma_24h=Sum('amount')
).order_by('-karma_24h')[:5]
```

The cool thing about this approach is that it's always accurate. Every time you fetch the leaderboard, it's calculating based on the current time. No cron jobs, no background workers, no stale data.

The trade-off is that this query is a bit more expensive than just reading a cached value. But for a leaderboard that only shows 5 users, it's totally fine. If this were a high-traffic production app, I'd probably add some caching with a 1-minute TTL.

## The Concurrency Problem (aka The Double-Like Bug)

Alright, this is the one that bit me during development. Let me tell you the story.

### The Bug

I had the like functionality working. Click the heart, the count goes up. Great! Then I decided to test what happens if you spam-click the like button really fast.

Boom. The like count went up by 3 even though I only liked it once.

Here's what was happening:

```python
# BAD CODE - Don't do this!
def like_post(request, pk):
    post = Post.objects.get(pk=pk)
    
    # Check if already liked
    if Like.objects.filter(user=request.user, post=post).exists():
        # Unlike
        Like.objects.filter(user=request.user, post=post).delete()
        post.like_count -= 1
    else:
        # Like
        Like.objects.create(user=request.user, post=post)
        post.like_count += 1
    
    post.save()
```

The problem? Between the time you check if a like exists and the time you create it, another request could sneak in and do the same thing. Race condition!

### The Fix

Two things needed to happen:

1. **Database-level constraint** - Make sure you can't create duplicate likes
2. **Row-level locking** - Lock the post while you're updating it

Here's the fixed version:

```python
from django.db import transaction

@transaction.atomic
def like_post(request, pk):
    # Lock this specific post row
    post = Post.objects.select_for_update().get(pk=pk)
    
    like, created = Like.objects.get_or_create(
        user=request.user,
        post=post
    )
    
    if created:
        # New like
        post.like_count = F('like_count') + 1
        post.save(update_fields=['like_count'])
        # Create karma transaction
        KarmaTransaction.objects.create(
            user=post.author,
            amount=1,
            reason='post_like'
        )
    else:
        # Unlike
        like.delete()
        post.like_count = F('like_count') - 1
        post.save(update_fields=['like_count'])
        KarmaTransaction.objects.create(
            user=post.author,
            amount=-1,
            reason='post_unlike'
        )
```

The key parts:

- `@transaction.atomic` - Everything happens in one database transaction
- `select_for_update()` - Locks the row so other requests have to wait
- `get_or_create()` - Atomic check-and-create operation
- `F('like_count') + 1` - Database-level increment (not Python-level)

Plus, I added a unique constraint in the model:

```python
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('user', 'post')
```

Now even if somehow two requests slip through, the database will reject the duplicate.

### Testing It

I tested this by rapidly clicking the like button (like, really fast). The count stays accurate. I also tried opening the app in two browser tabs and liking the same post simultaneously. Works perfectly.

The `select_for_update()` means the second request waits for the first one to finish before proceeding. There's a tiny bit of latency, but it's worth it for data integrity.

## Wrapping Up

These were the three main technical challenges I tackled:

1. **Comment trees** - Solved with recursive prefetching to avoid N+1 queries
2. **24-hour leaderboard** - Transaction log approach for dynamic time-based aggregation  
3. **Concurrency** - Row locking and atomic operations to prevent race conditions

The whole project was a fun exercise in thinking through edge cases and performance. If you want to see the full code, check out the `models.py`, `views.py`, and `serializers.py` files in the backend.

Thanks for reading! 🚀
