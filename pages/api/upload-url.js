import { Storage } from "@google-cloud/storage";
import allowCors from "../cors";

async function handler(req, res) {
  console.log(req.method + " " + req.url);
  if (req.query.servicekey !== process.env.STICKY_SERVICE_KEY) {
    res.status(403).json({ error: "Invalid/missing service key " });
  }

  const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY,
    },
  });

  const bucket = storage.bucket(process.env.BUCKET_NAME);
  const file = bucket.file(req.query.filename);

  // Create a signed URL that can be used to upload a file to GCP bucket
  const [response] = await file.generateSignedPostPolicyV4({
    expires: Date.now() + 1 * 60 * 1000, //  1 minute,
    fields: { "x-goog-meta-test": "data" },
    virtualHostedStyle: true,
  });
  res.status(200).json(response);
}

module.exports = allowCors(handler);
