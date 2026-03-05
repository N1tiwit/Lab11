import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./db";
import authRoutes from "./routes/authRoutes";
import pageRoutes from "./routes/pageRoutes";
import rateLimit from "express-rate-limit";

const app = express();

// important behind Render proxy
app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "./src/views");

// rate limit สำหรับ login

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Try again later."
});
// ใช้ limiter กับ route login

app.use(authRoutes);
app.use(pageRoutes);

const PORT = Number(process.env.PORT || 3000);

async function main() {
  await connectDB(process.env.MONGODB_URI!);

  app.listen(PORT, () => {
    console.log(`✅ http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("❌ Startup error:", err);
  process.exit(1);
});