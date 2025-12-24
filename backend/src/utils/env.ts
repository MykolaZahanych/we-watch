/**
 * Validates required environment variables at application startup
 * Exits the process if any required variables are missing
 */
export function validateEnv(): void {
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL', 'PORT', 'NODE_ENV'];

  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('❌ ERROR: Missing required environment variables:');
    missing.forEach((envVar) => {
      console.error(`   - ${envVar}`);
    });
    process.exit(1);
  }
}
