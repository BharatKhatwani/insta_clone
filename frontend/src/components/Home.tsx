import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  username: string;
}

interface Comment {
  _id: string;
  text: string;
  userId: User;
}

interface Post {
  _id: string;
  imageUrl: string;
  caption: string;
  userId: User;
  likes?: string[];
  comments?: Comment[];
  createdAt?: string;
}

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ imageUrl: "", caption: "" });
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<{ [key: string]: boolean }>({});

  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFeed();
    fetchFollowing();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data.posts || res.data);
    } catch (error) {
      console.error("Error fetching feed:", error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/follow/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowingIds(res.data.followingIds || []);
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  };

  const followUser = async (userId: string) => {
    setFollowLoading({ ...followLoading, [userId]: true });
    
    try {
      await axios.post(
        `http://localhost:5000/api/follow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowingIds([...followingIds, userId]);
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setFollowLoading({ ...followLoading, [userId]: false });
    }
  };

  const unfollowUser = async (userId: string) => {
    setFollowLoading({ ...followLoading, [userId]: true });
    
    try {
      await axios.delete(`http://localhost:5000/api/follow/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowingIds(followingIds.filter(id => id !== userId));
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setFollowLoading({ ...followLoading, [userId]: false });
    }
  };

  const likePost = async (postId: string) => {
    const post = posts.find(p => p._id === postId);
    const isLiked = post?.likes?.includes(currentUserId || "");
    
    setPosts(posts.map(p => {
      if (p._id === postId) {
        return {
          ...p,
          likes: isLiked 
            ? p.likes?.filter(id => id !== currentUserId) || []
            : [...(p.likes || []), currentUserId || ""]
        };
      }
      return p;
    }));
    
    try {
      if (isLiked) {
        await axios.post(
          `http://localhost:5000/api/posts/${postId}/unlike`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `http://localhost:5000/api/posts/${postId}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      fetchFeed();
    }
  };

  const addComment = async (postId: string) => {
    const text = commentTexts[postId]?.trim();
    if (!text) return;

    try {
      await axios.post(
        `http://localhost:5000/api/comments/${postId}`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCommentTexts({ ...commentTexts, [postId]: "" });
      
      const postRes = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPosts(posts.map(p => p._id === postId ? postRes.data : p));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const createPost = async () => {
    if (!newPost.imageUrl || !newPost.caption) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:5000/api/posts",
        newPost,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewPost({ imageUrl: "", caption: "" });
      setShowCreatePost(false);
      fetchFeed();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-mono ">
            InstaClone
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreatePost(true)}
              className=" text-black px-5 py-2.5 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition px-4 py-2 rounded-full hover:bg-gray-100 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {showCreatePost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 transform animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create New Post
              </h2>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://picsum.photos/400?random=8"
                  value={newPost.imageUrl}
                  onChange={(e) => setNewPost({ ...newPost, imageUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Caption
                </label>
                <textarea
                  placeholder="Progress over perfection 💯"
                  value={newPost.caption}
                  onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  rows={4}
                />
              </div>

              {newPost.imageUrl && (
                <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md">
                  <img
                    src={newPost.imageUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x300?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              )}

              <button
                onClick={createPost}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Posting..." : "Share Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {posts.map((post) => {
              const isFollowing = followingIds.includes(post.userId._id);
              const isSelf = post.userId._id === currentUserId;
              const isLiked = post.likes?.includes(currentUserId || "");

              return (
                <article
                  key={post._id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full  flex items-center justify-center text-black font-bold text-lg shadow-md">
                        {post.userId.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {post.userId.username}
                        </p>
                        {post.createdAt && (
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isSelf && (
                      <button
                        onClick={() =>
                          isFollowing
                            ? unfollowUser(post.userId._id)
                            : followUser(post.userId._id)
                        }
                        disabled={followLoading[post.userId._id]}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                          isFollowing
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : " text-black hover:from-purple-700 hover:to-pink-700"
                        }`}
                      >
                        {followLoading[post.userId._id] ? "..." : (isFollowing ? "Following" : "Follow")}
                      </button>
                    )}
                  </div>

                  <div className="w-full bg-gray-50">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-auto object-cover max-h-[700px]"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/600x400?text=Image+Not+Found";
                      }}
                    />
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-center gap-5 mb-4">
                      <button
                        onClick={() => likePost(post._id)}
                        className={`transition-all transform hover:scale-125 ${
                          isLiked ? "text-red-500" : "text-gray-700 hover:text-red-500"
                        }`}
                      >
                        <svg
                          className="w-8 h-8"
                          fill={isLiked ? "currentColor" : "none"}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>
                      <button className="text-gray-700 hover:text-purple-600 transition-all transform hover:scale-125">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </button>
                    </div>

                    {post.likes && post.likes.length > 0 && (
                      <p className="font-bold text-sm text-gray-900 mb-3">
                        {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
                      </p>
                    )}

                    <div className="mb-3">
                      <p className="text-gray-900">
                        <span className="font-bold mr-2">{post.userId.username}</span>
                        <span className="text-gray-700">{post.caption}</span>
                      </p>
                    </div>

                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                        {post.comments.map((comment) => (
                          <p key={comment._id} className="text-sm text-gray-900">
                            <span className="font-bold mr-2">
                              {comment.userId.username}
                            </span>
                            <span className="text-gray-700">{comment.text}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentTexts[post._id] || ""}
                        onChange={(e) =>
                          setCommentTexts({ ...commentTexts, [post._id]: e.target.value })
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            addComment(post._id);
                          }
                        }}
                        className="flex-1 px-4 py-2.5 text-sm border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                      <button
                        onClick={() => addComment(post._id)}
                        disabled={!commentTexts[post._id]?.trim()}
                        className=" text-black px-5 py-2.5 rounded-full font-semibold text-sm hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </main>
    </div>
  );
};

export default Home;