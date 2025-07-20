from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import uuid
import re
from src.models.blog import db, Post, Blog, Comment, NewsletterSubscriber

engagement_bp = Blueprint('engagement', __name__)

# Comments endpoints
@engagement_bp.route('/api/comments/<post_id>', methods=['GET'])
def get_comments(post_id):
    try:
        comments = Comment.query.filter_by(post_id=post_id, parent_id=None).order_by(Comment.created_at.desc()).all()
        
        def serialize_comment(comment):
            return {
                'id': comment.id,
                'author': comment.author_name,
                'email': comment.author_email,
                'content': comment.content,
                'timestamp': comment.created_at.isoformat(),
                'avatar': comment.avatar_url,
                'replies': [serialize_comment(reply) for reply in comment.replies]
            }
        
        return jsonify({
            'success': True,
            'comments': [serialize_comment(comment) for comment in comments]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@engagement_bp.route('/api/comments/<post_id>', methods=['POST'])
def create_comment(post_id):
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('author') or not data.get('content'):
            return jsonify({'success': False, 'error': 'Author and content are required'}), 400
        
        # Validate email format if provided
        email = data.get('email', '')
        if email and not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({'success': False, 'error': 'Invalid email format'}), 400
        
        # Check if post exists
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post not found'}), 404
        
        # Create comment
        comment = Comment(
            id=str(uuid.uuid4()),
            post_id=post_id,
            author_name=data['author'],
            author_email=email,
            content=data['content'],
            parent_id=data.get('replyTo'),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', ''),
            status='approved'  # Auto-approve for now, add moderation later
        )
        
        db.session.add(comment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'comment': {
                'id': comment.id,
                'author': comment.author_name,
                'content': comment.content,
                'timestamp': comment.created_at.isoformat()
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Newsletter endpoints
@engagement_bp.route('/api/newsletter/subscribe', methods=['POST'])
def subscribe_newsletter():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        # Validate email
        if not email or not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return jsonify({'success': False, 'error': 'Valid email is required'}), 400
        
        # Check if already subscribed
        existing = NewsletterSubscriber.query.filter_by(email=email).first()
        if existing:
            if existing.status == 'active':
                return jsonify({'success': False, 'error': 'Email already subscribed'}), 400
            else:
                # Reactivate subscription
                existing.status = 'active'
                existing.subscribed_at = datetime.utcnow()
                db.session.commit()
                return jsonify({'success': True, 'message': 'Subscription reactivated'})
        
        # Create new subscription
        subscriber = NewsletterSubscriber(
            id=str(uuid.uuid4()),
            email=email,
            source=data.get('source', 'website'),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', ''),
            status='active'
        )
        
        db.session.add(subscriber)
        db.session.commit()
        
        # TODO: Send confirmation email
        # TODO: Add to Mailchimp/other email service
        
        return jsonify({
            'success': True,
            'message': 'Successfully subscribed to newsletter'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@engagement_bp.route('/api/newsletter/unsubscribe', methods=['POST'])
def unsubscribe_newsletter():
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'success': False, 'error': 'Email is required'}), 400
        
        subscriber = NewsletterSubscriber.query.filter_by(email=email).first()
        if not subscriber:
            return jsonify({'success': False, 'error': 'Email not found'}), 404
        
        subscriber.status = 'unsubscribed'
        subscriber.unsubscribed_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Successfully unsubscribed from newsletter'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Trending posts endpoint
@engagement_bp.route('/api/trending-posts', methods=['GET'])
def get_trending_posts():
    try:
        limit = int(request.args.get('limit', 10))
        timeframe = request.args.get('timeframe', 'week')
        blog_slug = request.args.get('blog')
        
        # Calculate date threshold based on timeframe
        now = datetime.utcnow()
        if timeframe == 'day':
            threshold = now - timedelta(days=1)
        elif timeframe == 'week':
            threshold = now - timedelta(weeks=1)
        elif timeframe == 'month':
            threshold = now - timedelta(days=30)
        else:  # all time
            threshold = datetime.min
        
        # Build query
        query = db.session.query(Post).join(Blog)
        
        # Filter by blog if specified
        if blog_slug:
            query = query.filter(Blog.slug == blog_slug)
        
        # Filter by timeframe
        if timeframe != 'all':
            query = query.filter(Post.published_at >= threshold)
        
        # Order by trending score (views + comments + shares)
        # For now, we'll use a simple scoring system based on views
        posts = query.filter(Post.status == 'published').order_by(
            Post.views.desc()
        ).limit(limit).all()
        
        trending_posts = []
        for post in posts:
            # Calculate comment count manually
            comment_count = Comment.query.filter_by(post_id=post.id, status='approved').count()
            
            # Calculate trending score
            trending_score = min(100, (post.views // 10) + (comment_count * 5))
            
            trending_posts.append({
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'excerpt': post.excerpt or post.content[:200] + '...',
                'blog': {
                    'name': post.blog.title,
                    'slug': post.blog.slug,
                    'color': post.blog.primary_color
                },
                'author': post.author,
                'publishedAt': post.published_at.isoformat() if post.published_at else None,
                'readTime': post.read_time or 5,
                'views': post.views,
                'featuredImage': post.featured_image,
                'trending_score': trending_score
            })
        
        return jsonify({
            'success': True,
            'posts': trending_posts,
            'timeframe': timeframe,
            'total': len(trending_posts)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Analytics endpoints
@engagement_bp.route('/api/analytics/post-view', methods=['POST'])
def track_post_view():
    try:
        data = request.get_json()
        post_id = data.get('post_id')
        
        if not post_id:
            return jsonify({'success': False, 'error': 'Post ID is required'}), 400
        
        post = Post.query.get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post not found'}), 404
        
        # Increment view count
        post.views = (post.views or 0) + 1
        db.session.commit()
        
        return jsonify({'success': True, 'views': post.views})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@engagement_bp.route('/api/analytics/newsletter-stats', methods=['GET'])
def get_newsletter_stats():
    try:
        total_subscribers = NewsletterSubscriber.query.filter_by(status='active').count()
        
        # Calculate growth (subscribers in last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_subscribers = NewsletterSubscriber.query.filter(
            NewsletterSubscriber.status == 'active',
            NewsletterSubscriber.subscribed_at >= thirty_days_ago
        ).count()
        
        # Calculate growth percentage
        previous_total = total_subscribers - recent_subscribers
        growth_rate = (recent_subscribers / max(previous_total, 1)) * 100 if previous_total > 0 else 100
        
        return jsonify({
            'success': True,
            'stats': {
                'subscribers': total_subscribers,
                'openRate': 42.3,  # Mock data - integrate with email service
                'clickRate': 8.7,   # Mock data - integrate with email service
                'growth': round(growth_rate, 1)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Popular posts by blog
@engagement_bp.route('/api/popular-posts/<blog_slug>', methods=['GET'])
def get_popular_posts(blog_slug):
    try:
        limit = int(request.args.get('limit', 5))
        
        blog = Blog.query.filter_by(slug=blog_slug).first()
        if not blog:
            return jsonify({'success': False, 'error': 'Blog not found'}), 404
        
        posts = Post.query.filter_by(blog_id=blog.id, status='published').order_by(
            Post.views.desc()
        ).limit(limit).all()
        
        popular_posts = []
        for post in posts:
            popular_posts.append({
                'id': post.id,
                'title': post.title,
                'slug': post.slug,
                'excerpt': post.excerpt or post.content[:150] + '...',
                'views': post.views,
                'publishedAt': post.published_at.isoformat() if post.published_at else None,
                'readTime': post.read_time or 5,
                'featuredImage': post.featured_image
            })
        
        return jsonify({
            'success': True,
            'posts': popular_posts,
            'blog': {
                'name': blog.title,
                'slug': blog.slug
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

