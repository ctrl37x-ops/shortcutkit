import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack 루트 디렉토리 명시 (워크스페이스 감지 오류 방지)
  turbopack: {
    root: __dirname,
  },
  // 이미지 외부 도메인 허용 (필요 시 추가)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
