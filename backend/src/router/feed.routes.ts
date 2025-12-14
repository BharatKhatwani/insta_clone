import { Router, Request, Response } from "express";
import { authMiddleware } from "../authMiddleware";
import Follow from "../model/follow_model";
import Post, { IPost } from "../model/post_model";
import Like from "../model/like_model";
import Comment from "../model/comment_model";

const router = Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    
    const followingDocs = await Follow.find({ followerId: userId })
      .select("followingId");

    const followingIds = followingDocs.map(
      (doc) => doc.followingId
    );

    
    let followedPosts: IPost[] = [];

    if (followingIds.length > 0) {
      followedPosts = await Post.find({
        userId: { $in: followingIds },
      })
        .populate("userId", "username")
        .sort({ createdAt: -1 });
    }

    
    const otherPosts = await Post.find({
      userId: { $nin: [...followingIds, userId] },
    })
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .limit(10);

    
    const feed = [...followedPosts, ...otherPosts];

    
    const postIds = feed.map((post) => post._id);
    
    let likes: any[] = [];
    let comments: any[] = [];
    
    if (postIds.length > 0) {
      [likes, comments] = await Promise.all([
        Like.find({ postId: { $in: postIds } }).select("userId postId"),
        Comment.find({ postId: { $in: postIds } })
          .populate("userId", "username")
          .sort({ createdAt: 1 }),
      ]);
    }

    
    const feedWithDetails = feed.map((post) => {
      const postLikes = likes
        .filter((like) => like.postId.toString() === post._id.toString())
        .map((like) => like.userId.toString());
      
      const postComments = comments
        .filter((comment) => comment.postId.toString() === post._id.toString())
        .map((comment) => ({
          _id: comment._id.toString(),
          text: comment.text,
          userId: {
            _id: (comment.userId as any)._id.toString(),
            username: (comment.userId as any).username,
          },
        }));

      return {
        ...post.toObject(),
        likes: postLikes,
        comments: postComments,
      };
    });

    res.json({ posts: feedWithDetails });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
});

export default router;
