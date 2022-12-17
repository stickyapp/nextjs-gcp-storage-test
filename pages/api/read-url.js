import { Storage } from "@google-cloud/storage";
import allowCors from "../cors";

async function handler(req, res) {
  console.log(req.method + " " + req.url);
  const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY,
    },
  });

  // See https://googleapis.dev/nodejs/storage/latest/Bucket.html#getSignedUrl
  const [url] = await storage
    .bucket(process.env.BUCKET_NAME)
    .file(req.query.filename)
    .getSignedUrl({
      version: "v4",
      virtualHostedStyle: true,
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

  res.redirect(307, url);
}

module.exports = allowCors(handler);
