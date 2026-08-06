const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.AWS_S3_BUCKET;
const cloudFrontUrl = process.env.CLOUDFRONT_DOMAIN;

let s3Client = null;
if (bucketName && process.env.AWS_ACCESS_KEY_ID) {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
}

/**
 * Uploads a file buffer to Amazon S3.
 * Returns CloudFront URL, S3 URL, or fallback placeholder URL if S3 is not configured.
 */
async function uploadToS3({ key, body, contentType, isPrivate = false }) {
  if (!s3Client || !bucketName) {
    // Graceful fallback for local dev when S3 credentials/bucket are not provided
    const fallbackUrl = `https://mock-s3.local/${key}`;
    return { key, url: fallbackUrl, isPrivate };
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);

  if (isPrivate) {
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({ Bucket: bucketName, Key: key }), { expiresIn: 3600 });
    return { key, url: signedUrl, isPrivate: true };
  }

  const publicUrl = cloudFrontUrl
    ? `${cloudFrontUrl.replace(/\/$/, '')}/${key}`
    : `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

  return { key, url: publicUrl, isPrivate: false };
}

/**
 * Generates a presigned URL for private document access.
 */
async function getPresignedDownloadUrl(key, expiresInSeconds = 3600) {
  if (!s3Client || !bucketName) {
    return `https://mock-s3.local/${key}?signed=true`;
  }
  const command = new GetObjectCommand({ Bucket: bucketName, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

module.exports = {
  uploadToS3,
  getPresignedDownloadUrl,
};
