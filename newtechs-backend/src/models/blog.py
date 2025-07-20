from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Blog(db.Model):
    __tablename__ = 'blogs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(100), nullable=False, unique=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    tagline = db.Column(db.String(300))
    logo_url = db.Column(db.String(500))
    primary_color = db.Column(db.String(7), default='#0066FF')
    secondary_color = db.Column(db.String(7), default='#00D4FF')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    posts = db.relationship('Post', backref='blog', lazy=True, cascade='all, delete-orphan')
    categories = db.relationship('Category', backref='blog', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'title': self.title,
            'description': self.description,
            'tagline': self.tagline,
            'logo_url': self.logo_url,
            'primary_color': self.primary_color,
            'secondary_color': self.secondary_color,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'post_count': len(self.posts) if self.posts else 0
        }

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    blog_id = db.Column(db.Integer, db.ForeignKey('blogs.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    posts = db.relationship('Post', secondary='post_categories', back_populates='categories')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'blog_id': self.blog_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'post_count': len(self.posts) if self.posts else 0
        }

class Author(db.Model):
    __tablename__ = 'authors'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True)
    bio = db.Column(db.Text)
    avatar_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    posts = db.relationship('Post', backref='author', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'post_count': len(self.posts) if self.posts else 0
        }

# Association table for many-to-many relationship between posts and categories
post_categories = db.Table('post_categories',
    db.Column('post_id', db.Integer, db.ForeignKey('posts.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('categories.id'), primary_key=True)
)

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    slug = db.Column(db.String(300), nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    featured_image = db.Column(db.String(500))
    status = db.Column(db.String(20), default='published')  # draft, published, archived
    blog_id = db.Column(db.Integer, db.ForeignKey('blogs.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('authors.id'), nullable=False)
    views = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=False)
    meta_title = db.Column(db.String(300))
    meta_description = db.Column(db.String(500))
    original_url = db.Column(db.String(500))  # For migrated content
    original_id = db.Column(db.String(100))   # For migrated content
    published_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    categories = db.relationship('Category', secondary=post_categories, back_populates='posts')
    
    def to_dict(self, include_content=False):
        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'excerpt': self.excerpt,
            'featured_image': self.featured_image,
            'status': self.status,
            'blog_id': self.blog_id,
            'author_id': self.author_id,
            'views': self.views,
            'is_featured': self.is_featured,
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'author': self.author.to_dict() if self.author else None,
            'blog': self.blog.to_dict() if self.blog else None,
            'categories': [cat.to_dict() for cat in self.categories] if self.categories else []
        }
        
        if include_content:
            data['content'] = self.content
            
        return data


class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    parent_id = db.Column(db.String(36), db.ForeignKey('comments.id'), nullable=True)  # For replies
    author_name = db.Column(db.String(100), nullable=False)
    author_email = db.Column(db.String(120), nullable=True)
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, spam, deleted
    ip_address = db.Column(db.String(45))  # IPv4 or IPv6
    user_agent = db.Column(db.String(500))
    avatar_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    post = db.relationship('Post', backref='comments')
    replies = db.relationship('Comment', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')
    
    def to_dict(self, include_replies=True):
        data = {
            'id': self.id,
            'post_id': self.post_id,
            'parent_id': self.parent_id,
            'author_name': self.author_name,
            'author_email': self.author_email,
            'content': self.content,
            'status': self.status,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_replies and self.replies:
            data['replies'] = [reply.to_dict(include_replies=False) for reply in self.replies if reply.status == 'approved']
            
        return data

class NewsletterSubscriber(db.Model):
    __tablename__ = 'newsletter_subscribers'
    
    id = db.Column(db.String(36), primary_key=True)  # UUID
    email = db.Column(db.String(120), nullable=False, unique=True)
    status = db.Column(db.String(20), default='active')  # active, unsubscribed, bounced
    source = db.Column(db.String(50), default='website')  # website, popup, api, import
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(500))
    confirmation_token = db.Column(db.String(100))
    confirmed_at = db.Column(db.DateTime)
    subscribed_at = db.Column(db.DateTime, default=datetime.utcnow)
    unsubscribed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'status': self.status,
            'source': self.source,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'subscribed_at': self.subscribed_at.isoformat() if self.subscribed_at else None,
            'unsubscribed_at': self.unsubscribed_at.isoformat() if self.unsubscribed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Update Post model to include comment count
def update_post_comment_count():
    """Add comment_count property to Post model"""
    @property
    def comment_count(self):
        return Comment.query.filter_by(post_id=self.id, status='approved').count()
    
    Post.comment_count = comment_count

# Add read_time property to Post model
def update_post_read_time():
    """Add read_time property to Post model"""
    @property
    def read_time(self):
        if not self.content:
            return 1
        # Estimate reading time: average 200 words per minute
        word_count = len(self.content.split())
        return max(1, round(word_count / 200))
    
    Post.read_time = read_time

# Apply the updates
update_post_comment_count()
update_post_read_time()

