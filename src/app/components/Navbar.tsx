import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ShoppingCart, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-4 w-full">
      <nav className="bg-white rounded-full shadow-sm border border-neutral-200 pl-2 pr-2 py-2 w-full max-w-[760px] relative flex items-center">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 shrink-0 pl-1 sm:pl-1.5" aria-label="Convix Software">
          <svg viewBox="0 0 32 32" className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
            {/* 8 outer petals */}
            <circle cx="26" cy="16" r="3.5" fill="#ef4d23" />
            <circle cx="23.07" cy="23.07" r="3.5" fill="#ef4d23" />
            <circle cx="16" cy="26" r="3.5" fill="#ef4d23" />
            <circle cx="8.93" cy="23.07" r="3.5" fill="#ef4d23" />
            <circle cx="6" cy="16" r="3.5" fill="#ef4d23" />
            <circle cx="8.93" cy="8.93" r="3.5" fill="#ef4d23" />
            <circle cx="16" cy="6" r="3.5" fill="#ef4d23" />
            <circle cx="23.07" cy="8.93" r="3.5" fill="#ef4d23" />
            {/* Center circle */}
            <circle cx="16" cy="16" r="3.5" fill="#ef4d23" />
          </svg>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-[14px] pl-6 font-medium text-neutral-700">
          <a href="#home" className="flex items-center gap-2 text-neutral-900 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span>
            Home
          </a>
          <a href="#features" className="hover:text-neutral-900 transition-colors">
            Features
          </a>
          <a href="#about" className="hover:text-neutral-900 transition-colors">
            About
          </a>
          <a href="#pages" className="flex items-center gap-1 text-[#ef4d23] font-medium hover:opacity-90 transition-opacity">
            Pages
            <ChevronDown className="w-3.5 h-3.5 text-[#ef4d23]" />
          </a>
        </div>

        {/* Right Cluster */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Shopping Cart"
            className="hidden md:flex items-center justify-center text-neutral-700 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition-colors"
          >
            <ShoppingCart className="w-4 h-4 text-neutral-800" />
          </button>

          <a
            href="#access"
            className="inline-flex items-center gap-2 bg-[#ef4d23] hover:bg-[#e0431a] text-white rounded-full pl-4 sm:pl-5 pr-1.5 py-1.5 text-[13px] sm:text-[14px] font-medium transition-all shadow-sm shrink-0"
          >
            <span className="hidden sm:inline">Get early access</span>
            <span className="sm:hidden">Early access</span>
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </span>
          </a>

          {/* Mobile-only hamburger */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-neutral-700 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {open && (
          <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-3 z-20 flex flex-col gap-1 md:hidden">
            <a
              href="#home"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[14px] font-semibold text-neutral-900 rounded-xl hover:bg-neutral-50"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black inline-block"></span>
              Home
            </a>
            <a
              href="#features"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-[14px] font-medium text-neutral-700 rounded-xl hover:bg-neutral-50"
            >
              Features
            </a>
            <a
              href="#about"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-[14px] font-medium text-neutral-700 rounded-xl hover:bg-neutral-50"
            >
              About
            </a>
            <a
              href="#pages"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-[14px] font-medium text-[#ef4d23] rounded-xl hover:bg-neutral-50"
            >
              <span>Pages</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#ef4d23]" />
            </a>
            <a
              href="#cart"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[14px] font-medium text-neutral-700 rounded-xl hover:bg-neutral-50 border-t border-neutral-100 mt-1 pt-2"
            >
              <ShoppingCart className="w-4 h-4 text-neutral-800" />
              <span>Cart</span>
            </a>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
