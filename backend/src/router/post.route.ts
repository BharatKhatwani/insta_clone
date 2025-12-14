import { Router, Request, Response } from "express";
import Post from "../model/post_model";
import { authMiddleware } from "../authMiddleware";

const router = Router();

/**
 CREATE POST
 */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { imageUrl, caption } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const post = await Post.create({
      userId,
      imageUrl,
      caption,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create post" });
  }
});

/**
  DELETE POST
 */
router.delete("/:postId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { postId } = req.params;

    const post = await Post.findOne({ _id: postId });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // check ownership
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "You are not allowed to delete this post" });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post" });
  }
});

export default router;
