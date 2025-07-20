'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  timestamp: string;
  avatar?: string;
  replies?: Comment[];
}

interface CommentsProps {
  postId: string;
  postTitle: string;
  postUrl: string;
  disqusShortname?: string;
  enableCustomComments?: boolean;
}

// Disqus Integration Component
export function DisqusComments({ 
  postId, 
  postTitle, 
  postUrl, 
  disqusShortname = 'newtechs' 
}: CommentsProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && disqusShortname) {
      // Reset Disqus
      if (window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = postId;
            this.page.url = postUrl;
            this.page.title = postTitle;
          }
        });
      } else {
        // Load Disqus for the first time
        window.disqus_config = function () {
          this.page.url = postUrl;
          this.page.identifier = postId;
          this.page.title = postTitle;
        };

        const script = document.createElement('script');
        script.src = `https://${disqusShortname}.disqus.com/embed.js`;
        script.setAttribute('data-timestamp', Date.now().toString());
        document.head.appendChild(script);
      }
    }
  }, [postId, postTitle, postUrl, disqusShortname]);

  return (
    <div className="comments-section mt-12">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Comments
      </h3>
      <div id="disqus_thread"></div>
      <noscript>
        Please enable JavaScript to view the{' '}
        <a href="https://disqus.com/?ref_noscript">
          comments powered by Disqus.
        </a>
      </noscript>
    </div>
  );
}

// Custom Comments Component
export function CustomComments({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    author: '',
    email: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.author || !newComment.content) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/comments/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComment,
          replyTo,
        }),
      });

      if (response.ok) {
        setNewComment({ author: '', email: '', content: '' });
        setReplyTo(null);
        loadComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 mt-4' : 'mb-6'} bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-start gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          {comment.avatar ? (
            <Image
              src={comment.avatar}
              alt={comment.author}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {comment.author.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {comment.author}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(comment.timestamp)}
            </span>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {comment.content}
          </p>
          
          {!isReply && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reply
            </button>
          )}
          
          {replyTo === comment.id && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <form onSubmit={submitComment} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={newComment.author}
                    onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Your email (optional)"
                    value={newComment.email}
                    onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <textarea
                  placeholder="Write your reply..."
                  value={newComment.content}
                  onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {comment.replies && comment.replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} isReply={true} />
      ))}
    </div>
  );

  return (
    <div className="comments-section mt-12">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>
      
      {/* Comment Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Leave a Comment
        </h4>
        <form onSubmit={submitComment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your name"
              value={newComment.author}
              onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
            <input
              type="email"
              placeholder="Your email (optional)"
              value={newComment.email}
              onChange={(e) => setNewComment({ ...newComment, email: e.target.value })}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <textarea
            placeholder="Write your comment..."
            value={newComment.content}
            onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
      
      {/* Comments List */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}

// Main Comments Component with Platform Selection
export default function Comments(props: CommentsProps) {
  const { enableCustomComments = false } = props;
  
  if (enableCustomComments) {
    return <CustomComments postId={props.postId} />;
  }
  
  return <DisqusComments {...props} />;
}

// Global type declarations
interface DisqusConfig {
  page: {
    identifier: string;
    url: string;
    title: string;
  };
}

declare global {
  interface Window {
    DISQUS: {
      reset: (config: {
        reload: boolean;
        config: (this: DisqusConfig) => void;
      }) => void;
    };
    disqus_config: (this: DisqusConfig) => void;
  }
}

