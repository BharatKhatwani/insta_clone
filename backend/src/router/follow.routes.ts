import { Router, Request, Response } from "express";
import Follow from "../model/follow_model";
import { authMiddleware } from "../authMiddleware";

const router = Router();

/**
  FOLLOW A USER
 */
router.post("/:userId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).userId;
    const followingId = req.params.userId;

    // prevent self follow
    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    await Follow.create({
      followerId,
      followingId,
    });

    res.status(201).json({ message: "User followed successfully" });
  } catch (error: any) {
    // duplicate follow
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already following this user" });
    }

    res.status(500).json({ message: "Failed to follow user" });
  }
});

/**
 UNFOLLOW A USER
 */
router.delete("/:userId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).userId;
    const followingId = req.params.userId;

    const result = await Follow.findOneAndDelete({
      followerId,
      followingId,
    });

    if (!result) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to unfollow user" });
  }
});

/**
 GET MY FOLLOWING LIST
 */
router.get("/my", authMiddleware, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).userId;

    const followingDocs = await Follow.find({ followerId })
      .select("followingId");

    const followingIds = followingDocs.map(
      (doc) => doc.followingId.toString()
    );

    res.json({ followingIds });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch following list" });
  }
});

export default router;
