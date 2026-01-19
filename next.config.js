/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' data: blob:;
  connect-src 'self' ${isProd ? "https:" : "http: https: ws: wss:"} ${appOrigin};
  font-src 'self' https: data:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy.replace(/\n/g, " ") },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
  // HSTS chỉ hữu ích khi chạy HTTPS thật
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
];

const nextConfig = {
  reactStrictMode: true,
  experimental: { optimizePackageImports: ["zod"] },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  }
};

module.exports = nextConfig;
