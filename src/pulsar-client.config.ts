import {
  ClientConfig,
  AuthenticationTls,
  AuthenticationAthenz,
  AuthenticationToken,
  AuthenticationOauth2,
} from 'pulsar-client';

export const PULSAR_CLIENT = 'PULSAR_CLIENT';

function getAuthentication():
  | AuthenticationTls
  | AuthenticationAthenz
  | AuthenticationToken
  | AuthenticationOauth2
  | undefined {
  const authType = process.env.PULSAR_AUTH_TYPE;

  switch (authType) {
    case 'tls':
      return new AuthenticationTls({
        certificatePath: process.env.PULSAR_TLS_CERTIFICATE_PATH,
        privateKeyPath: process.env.PULSAR_TLS_PRIVATE_KEY_PATH,
      });
    case 'athenz':
      return new AuthenticationAthenz(process.env.PULSAR_ATHENZ_PARAMS);
    case 'token':
      return new AuthenticationToken({
        token: process.env.PULSAR_TOKEN,
      });
    case 'oauth2':
      return new AuthenticationOauth2({
        type: process.env.PULSAR_OAUTH2_TYPE,
        issuer_url: process.env.PULSAR_OAUTH2_ISSUER_URL,
        client_id: process.env.PULSAR_OAUTH2_CLIENT_ID,
        client_secret: process.env.PULSAR_OAUTH2_CLIENT_SECRET,
        private_key: process.env.PULSAR_OAUTH2_PRIVATE_KEY,
        audience: process.env.PULSAR_OAUTH2_AUDIENCE,
        scope: process.env.PULSAR_OAUTH2_SCOPE,
      });
    default:
      return undefined;
  }
}

function safeParseInt(value: string | undefined, fallback: number): number {
  const parsed = parseInt(value || '', 10);
  return isNaN(parsed) ? fallback : parsed;
}

export default (): { pulsar: ClientConfig } => ({
  pulsar: {
    serviceUrl: process.env.PULSAR_SERVICE_URL || 'pulsar://localhost:6650',
    authentication: getAuthentication(),
    operationTimeoutSeconds: safeParseInt(
      process.env.PULSAR_OPERATION_TIMEOUT_SECONDS,
      30,
    ),
    ioThreads: safeParseInt(process.env.PULSAR_IO_THREADS, 1),
    messageListenerThreads: safeParseInt(
      process.env.PULSAR_MESSAGE_LISTENER_THREADS,
      1,
    ),
    concurrentLookupRequest: safeParseInt(
      process.env.PULSAR_CONCURRENT_LOOKUP_REQUEST,
      undefined,
    ),
    useTls: process.env.PULSAR_USE_TLS === 'true' || undefined,
    tlsTrustCertsFilePath:
      process.env.PULSAR_TLS_TRUST_CERTS_FILE_PATH || undefined,
    tlsValidateHostname:
      process.env.PULSAR_TLS_VALIDATE_HOSTNAME === 'true' || undefined,
    tlsAllowInsecureConnection:
      process.env.PULSAR_TLS_ALLOW_INSECURE_CONNECTION === 'true' || undefined,
    statsIntervalInSeconds: safeParseInt(
      process.env.PULSAR_STATS_INTERVAL_IN_SECONDS,
      undefined,
    ),
    listenerName: process.env.PULSAR_LISTENER_NAME || undefined,
  },
});
