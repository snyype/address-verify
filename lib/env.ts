
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  return value
}

export function getOptionalEnv(key: keyof NodeJS.ProcessEnv, defaultValue: string): string {
  const value = process.env[key] || defaultValue
  console.log(`Optional environment variable: ${key} = ${value}`)
  return value
}

export function getBooleanEnv(key: keyof NodeJS.ProcessEnv, defaultValue = false): boolean {
  const value = process.env[key]?.toLowerCase()
  console.log(`Boolean environment variable: ${key} = ${value}`)
  if (!value) return defaultValue
  return ["true", "1", "yes", "on"].includes(value)
}

export function getNumberEnv(key: keyof NodeJS.ProcessEnv, defaultValue: number): number {
  const value = process.env[key]
  console.log(`Number environment variable: ${key} = ${value}`)
  if (!value) return defaultValue
  const parsed = Number.parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} is not a valid number: ${value}`)
  }
  return parsed
}

export const env = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  nodeEnv: process.env.NODE_ENV || "development",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL,
  authToken: process.env.AUTH_TOKEN,
  elasticsearchApiKey: process.env.ELASTICSEARCH_API_KEY,
  enableAnalytics: process.env.ENABLE_ANALYTICS,
  debug: process.env.DEBUG,
  port: process.env.PORT,
} as const
