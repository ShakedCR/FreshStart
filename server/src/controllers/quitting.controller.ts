import type { Request, Response } from "express";
import { UserModel } from "../models/User";

// Helper function to calculate days, hours, minutes
function calculateTimeDifference(startDate: Date) {
  const now = new Date();
  const diff = now.getTime() - startDate.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

// Get quitting stats for current user
export async function getQuittingStats(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let stats = {
      days: 0,
      hours: 0,
      minutes: 0,
      isActive: false,
      startDate: null as Date | null
    };

    if (user.quittingStartDate) {
      stats = {
        ...calculateTimeDifference(user.quittingStartDate),
        isActive: true,
        startDate: user.quittingStartDate
      };
    }

    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get quitting stats for any user (public)
export async function getUserQuittingStats(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let stats = {
      days: 0,
      hours: 0,
      minutes: 0,
      isActive: false,
      startDate: null as Date | null,
      username: user.username
    };

    if (user.quittingStartDate) {
      stats = {
        ...calculateTimeDifference(user.quittingStartDate),
        isActive: true,
        startDate: user.quittingStartDate,
        username: user.username
      };
    }

    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Start a new quitting attempt
export async function startQuitting(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // If there's an active attempt, move it to history first
    if (user.quittingStartDate) {
      const endDate = new Date();
      const daysSurvived = calculateTimeDifference(user.quittingStartDate).days;

      user.quittingHistory?.push({
        startDate: user.quittingStartDate,
        endDate: endDate,
        daysSurvived: daysSurvived
      });
    }

    // Start new attempt
    user.quittingStartDate = new Date();
    await user.save();

    const stats = calculateTimeDifference(user.quittingStartDate);
    return res.json({
      ...stats,
      isActive: true,
      startDate: user.quittingStartDate
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Stop current quitting attempt
export async function stopQuitting(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.quittingStartDate) {
      return res.status(400).json({ error: "No active quitting attempt" });
    }

    const endDate = new Date();
    const daysSurvived = calculateTimeDifference(user.quittingStartDate).days;

    user.quittingHistory?.push({
      startDate: user.quittingStartDate,
      endDate: endDate,
      daysSurvived: daysSurvived
    });

    user.quittingStartDate = null;
    await user.save();

    return res.json({
      message: "Quitting attempt stopped",
      daysSurvived: daysSurvived,
      history: user.quittingHistory
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Update quitting start date manually
export async function updateQuittingDate(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { newDate } = req.body;
    if (!newDate) return res.status(400).json({ error: "Date is required" });

    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Don't allow date in the future
    if (parsedDate > new Date()) {
      return res.status(400).json({ error: "Date cannot be in the future" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.quittingStartDate = parsedDate;
    await user.save();

    const stats = calculateTimeDifference(user.quittingStartDate);
    return res.json({
      ...stats,
      isActive: true,
      startDate: user.quittingStartDate,
      message: "Date updated successfully"
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get quitting history for current user
export async function getQuittingHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      history: user.quittingHistory || [],
      currentAttempt: user.quittingStartDate
        ? {
            startDate: user.quittingStartDate,
            ...calculateTimeDifference(user.quittingStartDate)
          }
        : null
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Get quitting history for any user (public)
export async function getUserQuittingHistory(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      history: user.quittingHistory || [],
      currentAttempt: user.quittingStartDate
        ? {
            startDate: user.quittingStartDate,
            ...calculateTimeDifference(user.quittingStartDate)
          }
        : null
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
