import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import { getPost, votePost, deletePost } from '../services/forumService';

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setIsLoading(true);
      const data = await getPost(postId);
      setPost(data);
    } catch (error) {
      console.error('Failed to load post:', error);
      alert('Failed to load post');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpvote = async () => {
    try {
      if (user.isAuthenticated) {
        await votePost(postId, user.uid, 'up');
        loadPost(); // Reload to get updated vote count
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await deletePost(postId);
      alert('Post deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-slate-500">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-slate-500">Post not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Feed</span>
      </button>

      {/* Post Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex">
          {/* Vote Sidebar */}
          <div className="w-16 bg-slate-50 border-r border-slate-100 flex flex-col items-center pt-6 gap-2">
            <button 
              onClick={handleUpvote}
              className="p-2 rounded hover:bg-slate-200 text-slate-500 hover:text-orange-500 transition-colors"
            >
              <ThumbsUp size={24} />
            </button>
            <span className="text-lg font-bold text-slate-700">{post.upvotes || 0}</span>
          </div>
          
          {/* Content */}
          <div className="p-6 flex-1">
            {/* Meta */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <span className="font-bold text-slate-900">{post.author || post.authorName}</span>
              <span>•</span>
              <span>{post.time || new Date(post.timestamp).toLocaleString()}</span>
              <span>•</span>
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full border border-slate-200">
                {post.category}
              </span>
              {user.uid === post.authorId && (
                <>
                  <div className="flex-1"></div>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </>
              )}
            </div>
            
            {/* Title & Content */}
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{post.title}</h1>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-slate-200 p-6">
          <CommentSection postId={postId} />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
