function validateConfig(env = process.env) {
  const fail = message => { const error = new Error(message); error.code = 'CONFIG'; throw error; };
  if (!env.JWT_SECRET || Buffer.byteLength(env.JWT_SECRET) < 32 || /replace|changeme|example/i.test(env.JWT_SECRET)) fail('JWT_SECRET requires a private random value of at least 32 bytes');
  if (env.NODE_ENV !== 'production') return;
  if (!env.MONGO_URI || !env.CORS_ORIGIN || !env.UPLOAD_DIR || !require('path').isAbsolute(env.UPLOAD_DIR)) fail('Production requires MONGO_URI, exact HTTPS CORS_ORIGIN and absolute persistent UPLOAD_DIR');
  for (const origin of env.CORS_ORIGIN.split(',').map(s => s.trim())) {
    try { const url = new URL(origin); if (url.protocol !== 'https:' || url.origin !== origin || url.username || url.password) fail('CORS origins must be exact HTTPS origins without paths'); }
    catch { fail('CORS origins must be exact HTTPS origins without paths'); }
  }
  if (!/^mongodb(?:\+srv)?:\/\//.test(env.MONGO_URI) || /(?:tls|ssl)=false/i.test(env.MONGO_URI)) fail('Production MongoDB must use a valid URI and cannot disable TLS');
  if (!env.MONGO_URI.startsWith('mongodb+srv://') && !/[?&](?:tls|ssl)=true(?:&|$)/i.test(env.MONGO_URI) && env.MONGO_NETWORK !== 'private') fail('Use TLS for MongoDB, or explicitly attest a private database network with MONGO_NETWORK=private');
}
module.exports = validateConfig;
