"use client"

import { AuthForm } from "@/components/auth-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 开发模式标志，从环境变量获取
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // 在开发模式下，自动跳转到上传页面
    if (DEV_MODE) {
      router.push('/audio-upload');
    }
  }, [router]);

  // 如果是开发模式，可以返回null或者加载组件
  if (DEV_MODE) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div
        className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl shadow-lg"
        style={{ marginBottom: '150px' }}
      >
        <h2 className="text-3xl font-bold text-center text-foreground">
          Log in to your account
        </h2>
        <AuthForm />
      </div>
    </div>
  );
}