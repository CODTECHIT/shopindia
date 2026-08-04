const jwt = require('jsonwebtoken');
const { CognitoJwtVerifier } = require('aws-jwt-verify');

let verifier = null;
if (process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID) {
  try {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      tokenUse: 'access',
      clientId: process.env.COGNITO_CLIENT_ID,
    });
  } catch (e) {
    console.warn('⚠️ Cognito verifier init failed, using dev fallback:', e.message);
  }
}

/**
 * verifyToken — verifies Amazon Cognito JWT token via JWKS.
 * If in development (NODE_ENV !== 'production'), allows dev secret fallback.
 * Strictly blocks dev secret fallback when NODE_ENV === 'production'.
 */
async function verifyToken(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const token = header.slice(7);

  // 1. Try Cognito verification if configured
  if (verifier) {
    try {
      const payload = await verifier.verify(token);
      req.user = {
        userId: payload.sub,
        email: payload.email || payload.username,
        role: (payload['cognito:groups'] && payload['cognito:groups'][0]) || 'customer',
        permissions: payload.permissions || [],
        vendorId: payload.vendorId,
      };
      return next();
    } catch (cognitoErr) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Cognito authentication failed: ' + cognitoErr.message });
      }
    }
  }

  // 2. Dev fallback check: gated behind NODE_ENV !== 'production'
  if (process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Authentication failed. Cognito configuration required in production.' });
  }

  // Local development JWT fallback
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'shopindia_dev_secret');
    req.user = payload;
    next();
  } catch (_err) {
    return res.status(401).json({ error: 'Token expired or invalid.' });
  }
}

module.exports = { verifyToken };
