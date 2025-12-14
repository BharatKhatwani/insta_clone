import { Router, Request, Response } from "express";
import { authMiddleware } from "../authMiddleware";
import Follow from "../model/follow_model";
import Post from "../model/post_model";

const router = Router();

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    
    const following = await Follow.find({ followerId: userId })
      .select("followingId");

    const followingIds = following.map(f => f.followingId);

    
    const followedPosts = await Post.find({
      userId: { $in: followingIds },
    })
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    
    const otherPosts = await Post.find({
      userId: { $nin: [...followingIds, userId] },
    })
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .limit(10);

    
    const feed = [...followedPosts, ...otherPosts];

    res.json({ posts: feed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch feed" });
  }
});

export default router;
