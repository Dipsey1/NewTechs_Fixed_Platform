from flask import Blueprint, request, jsonify
from src.models.blog import Blog, Post, Category, Author, db
from src.models.user import db as user_db
from datetime import datetime
import re

blog_bp = Blueprint('blog', __name__)

def create_slug(text):
    """Create URL-friendly slug from text"""
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

# Blog endpoints
@blog_bp.route('/blogs', methods=['GET'])
def get_blogs():
    """Get all blogs"""
    try:
        blogs = Blog.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'blogs': [blog.to_dict() for blog in blogs]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/blogs/<slug>', methods=['GET'])
def get_blog(slug):
    """Get specific blog by slug"""
    try:
        blog = Blog.query.filter_by(slug=slug, is_active=True).first()
        if not blog:
            return jsonify({'success': False, 'error': 'Blog not found'}), 404
        
        return jsonify({
            'success': True,
            'blog': blog.to_dict()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/blogs', methods=['POST'])
def create_blog():
    """Create new blog"""
    try:
        data = request.get_json()
        
        # Create slug from name
        slug = create_slug(data.get('name', ''))
        
        # Check if slug already exists
        existing = Blog.query.filter_by(slug=slug).first()
        if existing:
            return jsonify({'success': False, 'error': 'Blog with this name already exists'}), 400
        
        blog = Blog(
            name=data.get('name'),
            slug=slug,
            title=data.get('title'),
            description=data.get('description'),
            tagline=data.get('tagline'),
            logo_url=data.get('logo_url'),
            primary_color=data.get('primary_color', '#0066FF'),
            secondary_color=data.get('secondary_color', '#00D4FF')
        )
        
        db.session.add(blog)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'blog': blog.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Post endpoints
@blog_bp.route('/blogs/<blog_slug>/posts', methods=['GET'])
def get_blog_posts(blog_slug):
    """Get posts for a specific blog"""
    try:
        blog = Blog.query.filter_by(slug=blog_slug, is_active=True).first()
        if not blog:
            return jsonify({'success': False, 'error': 'Blog not found'}), 404
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', 'published')
        category = request.args.get('category')
        
        query = Post.query.filter_by(blog_id=blog.id, status=status)
        
        if category:
            query = query.join(Post.categories).filter(Category.slug == category)
        
        posts = query.order_by(Post.published_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'posts': [post.to_dict() for post in posts.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': posts.total,
                'pages': posts.pages,
                'has_next': posts.has_next,
                'has_prev': posts.has_prev
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/blogs/<blog_slug>/posts/<post_slug>', methods=['GET'])
def get_post(blog_slug, post_slug):
    """Get specific post"""
    try:
        blog = Blog.query.filter_by(slug=blog_slug, is_active=True).first()
        if not blog:
            return jsonify({'success': False, 'error': 'Blog not found'}), 404
        
        post = Post.query.filter_by(blog_id=blog.id, slug=post_slug, status='published').first()
        if not post:
            return jsonify({'success': False, 'error': 'Post not found'}), 404
        
        # Increment view count
        post.views += 1
        db.session.commit()
        
        return jsonify({
            'success': True,
            'post': post.to_dict(include_content=True)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/posts', methods=['POST'])
def create_post():
    """Create new post"""
    try:
        data = request.get_json()
        
        # Get or create author
        author_name = data.get('author_name', 'Admin')
        author = Author.query.filter_by(name=author_name).first()
        if not author:
            author = Author(name=author_name, email=data.get('author_email'))
            db.session.add(author)
            db.session.flush()
        
        # Create slug from title
        slug = create_slug(data.get('title', ''))
        
        # Ensure unique slug within blog
        blog_id = data.get('blog_id')
        counter = 1
        original_slug = slug
        while Post.query.filter_by(blog_id=blog_id, slug=slug).first():
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        post = Post(
            title=data.get('title'),
            slug=slug,
            content=data.get('content'),
            excerpt=data.get('excerpt'),
            featured_image=data.get('featured_image'),
            blog_id=blog_id,
            author_id=author.id,
            status=data.get('status', 'published'),
            is_featured=data.get('is_featured', False),
            meta_title=data.get('meta_title'),
            meta_description=data.get('meta_description'),
            original_url=data.get('original_url'),
            original_id=data.get('original_id'),
            published_at=datetime.fromisoformat(data['published_at']) if data.get('published_at') else datetime.utcnow()
        )
        
        db.session.add(post)
        db.session.flush()
        
        # Add categories
        category_names = data.get('categories', [])
        for cat_name in category_names:
            category = Category.query.filter_by(name=cat_name, blog_id=blog_id).first()
            if not category:
                category = Category(
                    name=cat_name,
                    slug=create_slug(cat_name),
                    blog_id=blog_id
                )
                db.session.add(category)
                db.session.flush()
            post.categories.append(category)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'post': post.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Category endpoints
@blog_bp.route('/blogs/<blog_slug>/categories', methods=['GET'])
def get_blog_categories(blog_slug):
    """Get categories for a specific blog"""
    try:
        blog = Blog.query.filter_by(slug=blog_slug, is_active=True).first()
        if not blog:
            return jsonify({'success': False, 'error': 'Blog not found'}), 404
        
        categories = Category.query.filter_by(blog_id=blog.id).all()
        
        return jsonify({
            'success': True,
            'categories': [category.to_dict() for category in categories]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Featured posts endpoint
@blog_bp.route('/featured-posts', methods=['GET'])
def get_featured_posts():
    """Get featured posts across all blogs"""
    try:
        limit = request.args.get('limit', 6, type=int)
        
        posts = Post.query.filter_by(status='published', is_featured=True)\
                         .order_by(Post.published_at.desc())\
                         .limit(limit).all()
        
        return jsonify({
            'success': True,
            'posts': [post.to_dict() for post in posts]
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Search endpoint
@blog_bp.route('/search', methods=['GET'])
def search_posts():
    """Search posts across all blogs"""
    try:
        query = request.args.get('q', '')
        blog_slug = request.args.get('blog')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        if not query:
            return jsonify({'success': False, 'error': 'Search query required'}), 400
        
        search_query = Post.query.filter_by(status='published')
        
        if blog_slug:
            blog = Blog.query.filter_by(slug=blog_slug).first()
            if blog:
                search_query = search_query.filter_by(blog_id=blog.id)
        
        search_query = search_query.filter(
            db.or_(
                Post.title.contains(query),
                Post.content.contains(query),
                Post.excerpt.contains(query)
            )
        )
        
        posts = search_query.order_by(Post.published_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'success': True,
            'posts': [post.to_dict() for post in posts.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': posts.total,
                'pages': posts.pages,
                'has_next': posts.has_next,
                'has_prev': posts.has_prev
            },
            'query': query
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

