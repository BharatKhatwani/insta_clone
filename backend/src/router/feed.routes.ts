import { Router, Request, Response } from "express";
import { authMiddleware } from "../authMiddleware";
import Follow from "../model/follow_model";
import Post from "../model/post_model";

const router = Router();

/**
 * GET FEED
 
 */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;


    const following = await Follow.find({ followerId: userId })
      .select("followingId");

    const followingIds = following.map((f) => f.followingId);


    const posts = await Post.find({
      userId: { $in: followingIds },
    })
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch feed" });
  }
});

export default router;
