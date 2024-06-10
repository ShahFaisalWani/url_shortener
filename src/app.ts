import express, { Request, Response } from "express";
import path from "path";
import crypto from "crypto";
import { pool } from "./db";
import { env } from "./env";

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

interface URLRequest {
  url: string;
}

const getShortUrl = async (long_url: string) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT short_url FROM urls WHERE long_url = ?",
      [long_url]
    );
    const results = rows as { short_url: string }[];

    if (results.length > 0) {
      return results[0];
    } else {
      return null;
    }
  } catch (err) {
    return null;
  } finally {
    conn.release();
  }
};

app.post("/shorten", async (req: Request, res: Response) => {
  const { url }: URLRequest = req.body;

  let shortUrl;
  const found = await getShortUrl(url);
  if (found) {
    res.json({ short_url: `${env.APP_BASE_URL}/${found.short_url}` });
    return;
  } else {
    shortUrl = crypto.createHash("md5").update(url).digest("hex").slice(0, 6);
  }

  const conn = await pool.getConnection();
  try {
    await conn.execute("INSERT INTO urls (short_url, long_url) VALUES (?, ?)", [
      shortUrl,
      url,
    ]);
    res.json({ short_url: `${env.APP_BASE_URL}/${shortUrl}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to shorten URL" });
  } finally {
    conn.release();
  }
});

app.get("/:shortUrl", async (req: Request, res: Response) => {
  const { shortUrl } = req.params;

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT long_url FROM urls WHERE short_url = ?",
      [shortUrl]
    );
    const results = rows as { long_url: string }[];

    if (results.length > 0) {
      res.redirect(results[0].long_url);
    } else {
      res.status(404).json({ error: "URL not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve URL" });
  } finally {
    conn.release();
  }
});

const createTable = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS urls (
        id INT AUTO_INCREMENT PRIMARY KEY,
        short_url VARCHAR(255) NOT NULL,
        long_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created urls ensured");
  } catch (err) {
    console.error("Failed to create table:", err);
  } finally {
    conn.release();
  }
};

app.listen(env.PORT, async () => {
  await createTable();
  console.log(`Server is running at http://localhost:${env.PORT}`);
});
