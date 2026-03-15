"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  Mail,
  Github,
  Twitter,
  MessageCircle,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "功能介绍", href: "/about" },
      // { label: "使用教程", href: "/blog" },
      { label: "博客", href: "/blog" },
    ],
    support: [
      { label: "常见问题", href: "/about" },
      // { label: "联系我们", href: "/about" },
      { label: "反馈建议", href: "mailto:dev@huayemao.fun" },
    ],
    legal: [
      { label: "隐私政策", href: "/about" },
      { label: "使用条款", href: "/about" },
    ],
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Mail, href: "mailto:dev@huayemao.fun", label: "Email" },
  ];

  return (
    <footer className="bg-white border-t border-neutral-100">
      {/* 赞赏区域 */}

      {/* 主要内容区域 */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* 品牌信息 */}
            <div className="col-span-2 md:col-span-1 border-neutral-100">
              <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src="/wx_reward_qrcode.png"
                    alt="微信赞赏码"
                    className="w-32 h-32 rounded-xl shadow-lg border border-neutral-100 hover:shadow-xl transition-shadow"
                  />
                  <span className="text-xs text-neutral-400">
                    微信扫一扫，支持创作者
                  </span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500">
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  <span className="text-sm font-medium">
                    如果这个项目对你有帮助，欢迎赞赏支持
                  </span>
                </div>
              </div>
            </div>

            {/* 产品链接 */}
            <div>
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">
                产品
              </h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-neutral-500 hover:text-red-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 支持链接 */}
            <div>
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">
                支持
              </h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-neutral-500 hover:text-red-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 法律链接 */}
            <div>
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider mb-4">
                法律
              </h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-neutral-500 hover:text-red-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 底部版权 */}
          <div className="pt-8 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-400">
              © {currentYear} RedCanvas. Made with{" "}
              <Heart className="w-3 h-3 inline text-red-400 fill-red-400" /> by
              花野猫
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs text-neutral-400">
                基于 MIT 协议开源
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
