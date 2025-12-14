import { Router, Request, Response } from "express";
import Like from "../model/like_model";
import { authMiddleware } from "../authMiddleware";

const router = Router();

/**
  LIKE A POST
 */
router.post("/:postId/like", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    await Like.create({
      userId,
      postId,
    });

    res.status(201).json({ message: "Post liked" });
  } catch (error: any) {
    // duplicate like
    if (error.code === 11000) {
      return res.status(400).json({ message: "Post already liked" });
    }

    res.status(500).json({ message: "Failed to like post" });
  }
});
 
router.delete("/:postId/unlike", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { postId } = req.params;

    const result = await Like.findOneAndDelete({
      userId,
      postId,
    });

    if (!result) {
      return res.status(400).json({ message: "Post not liked yet" });
    }

    res.json({ message: "Post unliked" });
  } catch (error) {
    res.status(500).json({ message: "Failed to unlike post" });
  }
});

export default router;


