from flask import Blueprint, request, jsonify
from src.models.blog import Blog, Post, Category, Author, db
import xml.etree.ElementTree as ET
import re
from datetime import datetime
from html import unescape
import os

migration_bp = Blueprint('migration', __name__)

def clean_html_content(html_content):
    """Clean and simplify HTML content from Blogger"""
    if not html_content:
        return ""
    
    # Unescape HTML entities
    content = unescape(html_content)
    
    # Remove excessive styling and clean up
    content = re.sub(r'style="[^"]*"', '', content)
    content = re.sub(r'class="[^"]*"', '', content)
    content = re.sub(r'data-[^=]*="[^"]*"', '', content)
    content = re.sub(r'<div[^>]*>', '<div>', content)
    content = re.sub(r'<span[^>]*>', '<span>', content)
    content = re.sub(r'<p[^>]*>', '<p>', content)
    
    # Convert Blogger image URLs to simpler format
    content = re.sub(r'https://blogger\.googleusercontent\.com/img/[^"]*', '', content)
    
    # Remove empty tags
    content = re.sub(r'<(\w+)[^>]*>\s*</\1>', '', content)
    content = re.sub(r'<(\w+)[^>]*>\s*<br\s*/?\s*>\s*</\1>', '', content)
    
    # Clean up excessive whitespace
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'>\s+<', '><', content)
    
    return content.strip()

def extract_excerpt(content, max_length=200):
    """Extract excerpt from content"""
    # Remove HTML tags for excerpt
    text = re.sub(r'<[^>]+>', '', content)
    text = re.sub(r'\s+', ' ', text).strip()
    
    if len(text) <= max_length:
        return text
    
    # Find last complete sentence within limit
    excerpt = text[:max_length]
    last_period = excerpt.rfind('.')
    if last_period > max_length * 0.7:  # If period is reasonably close to end
        return excerpt[:last_period + 1]
    
    # Otherwise, cut at last space
    last_space = excerpt.rfind(' ')
    if last_space > 0:
        return excerpt[:last_space] + '...'
    
    return excerpt + '...'

def create_slug(text):
    """Create URL-friendly slug from text"""
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

@migration_bp.route('/migrate/blogger', methods=['POST'])
def migrate_blogger_content():
    """Migrate content from Blogger XML feeds"""
    try:
        data = request.get_json()
        blog_mapping = data.get('blog_mapping', {})
        
        if not blog_mapping:
            return jsonify({'success': False, 'error': 'Blog mapping required'}), 400
        
        results = {
            'blogs_processed': 0,
            'posts_imported': 0,
            'categories_created': 0,
            'authors_created': 0,
            'errors': []
        }
        
        # Process each blog
        for blogger_folder, blog_slug in blog_mapping.items():
            try:
                # Get or create blog
                blog = Blog.query.filter_by(slug=blog_slug).first()
                if not blog:
                    results['errors'].append(f"Blog '{blog_slug}' not found")
                    continue
                
                # Path to the Blogger feed
                feed_path = f"/home/ubuntu/Takeout/Blogger/Blogs/{blogger_folder}/feed.atom"
                
                if not os.path.exists(feed_path):
                    results['errors'].append(f"Feed file not found: {feed_path}")
                    continue
                
                # Parse XML feed
                tree = ET.parse(feed_path)
                root = tree.getroot()
                
                # Define namespaces
                namespaces = {
                    'atom': 'http://www.w3.org/2005/Atom',
                    'blogger': 'http://schemas.google.com/blogger/2018'
                }
                
                # Process entries
                entries = root.findall('atom:entry', namespaces)
                
                for entry in entries:
                    try:
                        # Check if it's a post (not a comment or other type)
                        entry_type = entry.find('blogger:type', namespaces)
                        if entry_type is None or entry_type.text != 'POST':
                            continue
                        
                        # Check if it's published
                        status = entry.find('blogger:status', namespaces)
                        if status is None or status.text != 'LIVE':
                            continue
                        
                        # Extract post data
                        title_elem = entry.find('atom:title', namespaces)
                        title = title_elem.text if title_elem is not None else 'Untitled'
                        
                        content_elem = entry.find('atom:content', namespaces)
                        content = content_elem.text if content_elem is not None else ''
                        content = clean_html_content(content)
                        
                        # Extract author
                        author_elem = entry.find('atom:author/atom:name', namespaces)
                        author_name = author_elem.text if author_elem is not None else 'Unknown'
                        
                        # Get or create author
                        author = Author.query.filter_by(name=author_name).first()
                        if not author:
                            author = Author(name=author_name)
                            db.session.add(author)
                            db.session.flush()
                            results['authors_created'] += 1
                        
                        # Extract dates
                        published_elem = entry.find('atom:published', namespaces)
                        published_at = datetime.fromisoformat(published_elem.text.replace('Z', '+00:00')) if published_elem is not None else datetime.utcnow()
                        
                        # Extract original URL and ID
                        id_elem = entry.find('atom:id', namespaces)
                        original_id = id_elem.text if id_elem is not None else None
                        
                        filename_elem = entry.find('blogger:filename', namespaces)
                        original_url = filename_elem.text if filename_elem is not None else None
                        
                        # Create slug
                        slug = create_slug(title)
                        
                        # Ensure unique slug within blog
                        counter = 1
                        original_slug = slug
                        while Post.query.filter_by(blog_id=blog.id, slug=slug).first():
                            slug = f"{original_slug}-{counter}"
                            counter += 1
                        
                        # Check if post already exists (by original_id)
                        if original_id:
                            existing_post = Post.query.filter_by(original_id=original_id).first()
                            if existing_post:
                                continue  # Skip if already imported
                        
                        # Create excerpt
                        excerpt = extract_excerpt(content)
                        
                        # Create post
                        post = Post(
                            title=title,
                            slug=slug,
                            content=content,
                            excerpt=excerpt,
                            blog_id=blog.id,
                            author_id=author.id,
                            status='published',
                            original_url=original_url,
                            original_id=original_id,
                            published_at=published_at,
                            meta_title=title,
                            meta_description=excerpt
                        )
                        
                        db.session.add(post)
                        db.session.flush()
                        
                        # Extract and create categories
                        categories = entry.findall('atom:category', namespaces)
                        for cat_elem in categories:
                            term = cat_elem.get('term')
                            if term:
                                # Get or create category
                                category = Category.query.filter_by(name=term, blog_id=blog.id).first()
                                if not category:
                                    category = Category(
                                        name=term,
                                        slug=create_slug(term),
                                        blog_id=blog.id
                                    )
                                    db.session.add(category)
                                    db.session.flush()
                                    results['categories_created'] += 1
                                
                                post.categories.append(category)
                        
                        results['posts_imported'] += 1
                        
                    except Exception as e:
                        results['errors'].append(f"Error processing post in {blogger_folder}: {str(e)}")
                        continue
                
                results['blogs_processed'] += 1
                
            except Exception as e:
                results['errors'].append(f"Error processing blog {blogger_folder}: {str(e)}")
                continue
        
        # Commit all changes
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@migration_bp.route('/migrate/setup-blogs', methods=['POST'])
def setup_initial_blogs():
    """Set up the initial blog structure"""
    try:
        blogs_data = [
            {
                'name': 'NewTechs',
                'title': 'NewTechs - The Coolest Techs on Ice',
                'description': 'Stay ahead of the tech curve with cutting-edge insights, reviews, and analysis.',
                'tagline': 'The Coolest Techs on Ice',
                'logo_url': '/design_assets/newtechs_logo_main.png',
                'primary_color': '#0066FF',
                'secondary_color': '#00D4FF'
            },
            {
                'name': 'Crypto Updates',
                'title': 'Crypto Updates',
                'description': 'Cryptocurrency news, analysis, and market insights.',
                'tagline': 'There ain\'t no party like a crypto party',
                'logo_url': '/design_assets/crypto_updates_logo.png',
                'primary_color': '#FFD700',
                'secondary_color': '#FF8C00'
            },
            {
                'name': 'TechSpot365',
                'title': 'TechSpot365',
                'description': 'Tech news and updates 24/7.',
                'tagline': 'Tech news and updates 24/7',
                'logo_url': '/design_assets/techspot365_logo.png',
                'primary_color': '#00FF88',
                'secondary_color': '#0066FF'
            },
            {
                'name': 'TheMasterMinds',
                'title': 'TheMasterMinds',
                'description': 'Tech insights and analysis from industry experts.',
                'tagline': 'Tech insights and analysis',
                'logo_url': '/design_assets/masterminds_logo.png',
                'primary_color': '#8B5CF6',
                'secondary_color': '#C0C0C0'
            },
            {
                'name': 'The Gambia Network',
                'title': 'The Gambia Network',
                'description': 'Connecting tech innovation in The Gambia.',
                'tagline': 'Connecting tech in The Gambia',
                'logo_url': '/design_assets/gambia_network_logo.png',
                'primary_color': '#FF0000',
                'secondary_color': '#00AA00'
            },
            {
                'name': 'The Grand Bantaba',
                'title': 'The Grand Bantaba',
                'description': 'A place for tech community discussions and knowledge sharing.',
                'tagline': 'Community discussions',
                'logo_url': '/design_assets/bantaba_logo.png',
                'primary_color': '#FF6B35',
                'secondary_color': '#8B4513'
            },
            {
                'name': 'dibz inc',
                'title': 'dibz inc',
                'description': 'Startup stories, business insights, and entrepreneurship in tech.',
                'tagline': 'Business and startup content',
                'logo_url': '/design_assets/dibz_inc_logo.png',
                'primary_color': '#1E40AF',
                'secondary_color': '#10B981'
            }
        ]
        
        created_blogs = []
        
        for blog_data in blogs_data:
            slug = create_slug(blog_data['name'])
            
            # Check if blog already exists
            existing = Blog.query.filter_by(slug=slug).first()
            if existing:
                created_blogs.append(existing.to_dict())
                continue
            
            blog = Blog(
                name=blog_data['name'],
                slug=slug,
                title=blog_data['title'],
                description=blog_data['description'],
                tagline=blog_data['tagline'],
                logo_url=blog_data['logo_url'],
                primary_color=blog_data['primary_color'],
                secondary_color=blog_data['secondary_color']
            )
            
            db.session.add(blog)
            db.session.flush()
            created_blogs.append(blog.to_dict())
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'blogs': created_blogs,
            'message': f'Successfully set up {len(created_blogs)} blogs'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@migration_bp.route('/migrate/status', methods=['GET'])
def get_migration_status():
    """Get current migration status"""
    try:
        blogs = Blog.query.all()
        total_posts = Post.query.count()
        total_categories = Category.query.count()
        total_authors = Author.query.count()
        
        blog_stats = []
        for blog in blogs:
            blog_posts = Post.query.filter_by(blog_id=blog.id).count()
            blog_categories = Category.query.filter_by(blog_id=blog.id).count()
            
            blog_stats.append({
                'blog': blog.to_dict(),
                'posts': blog_posts,
                'categories': blog_categories
            })
        
        return jsonify({
            'success': True,
            'stats': {
                'total_blogs': len(blogs),
                'total_posts': total_posts,
                'total_categories': total_categories,
                'total_authors': total_authors,
                'blog_breakdown': blog_stats
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

