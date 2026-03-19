"use client"
import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="h-16 flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-neutral-100 px-6 flex items-center justify-between z-50">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="bg-red-500 p-1.5 rounded-lg shadow-lg shadow-red-200">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-neutral-900 tracking-tight leading-none">RedCanvas</span>
            <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">XHS Creative Suite</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-700 hover:text-red-500 transition-colors"
          >
            主页
          </Link>
          <Link
            href="/store"
            className="text-sm font-medium text-neutral-700 hover:text-red-500 transition-colors"
          >
            模板商店
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-neutral-700 hover:text-red-500 transition-colors"
          >
            博客
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-neutral-700 hover:text-red-500 transition-colors"
          >
            关于
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-neutral-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
        >
          {isMenuOpen ? (
            <X className="w-5 h-5 text-neutral-700" />
          ) : (
            <Menu className="w-5 h-5 text-neutral-700" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation Menu */}
      <div 
        className={`fixed inset-0 bg-white z-40 md:hidden transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-16 border-b border-neutral-100 flex items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-red-500 p-1.5 rounded-lg shadow-lg shadow-red-200">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-neutral-900 tracking-tight leading-none">RedCanvas</span>
              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-0.5">XHS Creative Suite</span>
            </div>
          </Link>
          <button 
            className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
            onClick={() => setIsMenuOpen(false)}
            aria-label="关闭菜单"
          >
            <X className="w-5 h-5 text-neutral-700" />
          </button>
        </div>
        <div className="p-6 flex flex-col gap-6">
          <Link
            href="/"
            className="text-lg font-medium text-neutral-700 hover:text-red-500 transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            主页
          </Link>
          <Link
            href="/store"
            className="text-lg font-medium text-neutral-700 hover:text-red-500 transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            模板商店
          </Link>
          <Link
            href="/blog"
            className="text-lg font-medium text-neutral-700 hover:text-red-500 transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            博客
          </Link>
          <Link
            href="/about"
            className="text-lg font-medium text-neutral-700 hover:text-red-500 transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            关于
          </Link>
        </div>
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}