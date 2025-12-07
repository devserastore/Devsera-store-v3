import { useState } from 'react';
import { mockCommunityPosts } from '@/data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function CommunityPage() {
  const [newPost, setNewPost] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    toast({
      title: 'Post created!',
      description: 'Your post has been shared with the community.',
    });
    setNewPost('');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold font-['Space_Grotesk'] mb-2">
            Community
          </h1>
          <p className="text-muted-foreground">
            Share your experiences and connect with other users
          </p>
        </div>

        {/* Create Post */}
        {user && (
          <div className="brutalist-card p-6 mb-8">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Share your experience with the community..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="border-2 border-black min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="brutalist-button bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {mockCommunityPosts.map(post => (
            <div key={post.id} className="brutalist-card p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex items-start space-x-4">
                <Avatar className="border-2 border-black">
                  <AvatarImage src={post.userAvatar} />
                  <AvatarFallback>{post.userName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{post.userName}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {formatTimeAgo(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-muted-foreground hover:text-red-500 transition-colors">
                      <Heart className="h-5 w-5" />
                      <span className="text-sm font-semibold">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm font-semibold">{post.comments}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!user && (
          <div className="brutalist-card p-8 text-center mt-8 bg-muted/30">
            <p className="text-lg font-semibold mb-4">
              Join the community to share your experiences
            </p>
            <Button
              onClick={() => window.location.href = '/register'}
              className="brutalist-button bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign Up Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
