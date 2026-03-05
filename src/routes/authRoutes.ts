import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { User } from "../models/User";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Try again later."
});

// Register
router.post("/register", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.redirect("/login?err=duplicate");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ email, passwordHash });

  res.redirect("/login");
});

// Login
router.post("/login", loginLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.redirect("/login?err=invalid");

  const ok = await bcrypt.compare(password, (user as any).passwordHash);
  if (!ok) return res.redirect("/login?err=invalid");

  const token = jwt.sign(
    { userId: user._id.toString(), email },
    process.env.JWT_SECRET!,
    { expiresIn: "2h" }
  );

  res.cookie("token", token, { httpOnly: true });
  res.redirect("/profile");
});

// Logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect("/");
});

export default router;