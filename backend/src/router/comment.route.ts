import { Router, Request, Response } from "express";
import { authMiddleware } from "../authMiddleware";
import Comment from "../model/comment_model";

const router = Router();

/**
  ADD COMMENT TO POST
 */
router.post("/:postId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = await Comment.create({
      userId,
      postId,
      text,
    });

    res.status(201).json({
      message: "Comment added",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

/**
  GET COMMENTS OF A POST
 */
router.get("/:postId", async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId })
      .populate("userId", "username")
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

export default router;
