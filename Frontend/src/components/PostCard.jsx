import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { votePost } from '../services/forumService';

const PostCard = ({ post, onVote }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [votes, setVotes] = useState(post.upvotes || 0);
  const [hasVoted, setHasVoted] = useState(post.hasVoted || false);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    setVotes(post.upvotes || 0);
    setHasVoted(post.hasVoted || false);
  }, [post.upvotes, post.hasVoted]);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (!user.isAuthenticated || isVoting) return;

    setIsVoting(true);
    
    // Optimistic Logic
    const isUpvoting = !hasVoted;
    
    setVotes(prev => isUpvoting ? prev + 1 : prev - 1);
    setHasVoted(isUpvoting);

    try {
      await votePost(post.id, user.uid, 'up'); // Backend handles toggle
      if (onVote) onVote(post.id);
    } catch (error) {
      console.error('Failed to vote:', error);
      // Revert
      setVotes(prev => isUpvoting ? prev - 1 : prev + 1);
      setHasVoted(!isUpvoting);
      alert("Vote failed.");
    } finally {
      setIsVoting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <article 
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
    >
      <div className="flex">
        {/* Vote Sidebar */}
        <div className="w-12 bg-slate-50 border-r border-slate-100 flex flex-col items-center pt-4 gap-1">
          <button 
            onClick={handleUpvote}
            className={`p-1 rounded transition-colors ${
              hasVoted 
                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                : 'hover:bg-slate-200 text-slate-500 hover:text-orange-500'
            }`}
          >
            <ThumbsUp size={20} className={hasVoted ? "fill-current" : ""} />
          </button>
          <span className="text-sm font-bold text-slate-700">{votes}</span>
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="font-bold text-slate-900 hover:underline">{post.username || post.author || "Anonymous"}</span>
            <span>•</span>
            <span>{new Date(post.createdAt || post.timestamp).toLocaleString()}</span>
            <span>•</span>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
              {post.category}
            </span>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{post.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">{post.content}</p>
          
          <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
            <button className="flex items-center gap-2 hover:bg-slate-100 px-2 py-1 rounded transition-colors">
              <MessageSquare size={18} />
              {post.comments || post.commentCount || 0} Comments
            </button>

            <div className="flex-1"></div>
            <button className="hover:bg-slate-100 p-1 rounded">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
