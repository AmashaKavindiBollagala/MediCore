// kaveesha-agoraConfig.js
// Agora SDK configuration for telemedicine service

import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;

export const agoraConfig = {
  appId: process.env.AGORA_APP_ID,
  appCertificate: process.env.AGORA_APP_CERTIFICATE,
  tokenExpirySeconds: parseInt(process.env.AGORA_TOKEN_EXPIRY || '3600'), // 1 hour default
};

/**
 * Generate an Agora RTC token for a specific channel and user
 * @param {string} channelName - Unique channel/room name
 * @param {number} uid - User UID (integer)
 * @param {string} role - 'publisher' or 'subscriber'
 * @returns {string} Agora RTC token
 */
export function generateAgoraToken(channelName, uid, role = 'publisher') {
  const { appId, appCertificate, tokenExpirySeconds } = agoraConfig;

  if (!appId || !appCertificate) {
    throw new Error('Agora App ID and Certificate must be configured in environment variables');
  }

  console.log('[Agora Token Generation]');
  console.log('  App ID:', appId);
  console.log('  Channel:', channelName);
  console.log('  UID:', uid);
  console.log('  Role:', role);
  console.log('  Expiry:', tokenExpirySeconds, 'seconds');

  const rtcRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  const expirationTime = Math.floor(Date.now() / 1000) + tokenExpirySeconds;
  const privilegeExpirationTime = expirationTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    rtcRole,
    expirationTime,
    privilegeExpirationTime
  );

  console.log('  Token (first 50 chars):', token.substring(0, 50) + '...');

  return { token, expiresAt: new Date(expirationTime * 1000) };
}

/**
 * Generate a unique channel name for a session
 * @param {string} appointmentId - Appointment UUID
 * @returns {string} Unique channel name
 */
export function generateChannelName(appointmentId) {
  const sanitized = appointmentId.replace(/-/g, '').substring(0, 16);
  const ts = Date.now().toString(36);
  return `medicore_${sanitized}_${ts}`;
}

/**
 * Generate a numeric UID for Agora (must be uint32)
 * @returns {number} Random UID
 */
export function generateUID() {
  return Math.floor(Math.random() * 2147483647) + 1;
}

export default agoraConfig;