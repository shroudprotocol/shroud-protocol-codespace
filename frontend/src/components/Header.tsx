"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Header() {
  // CORRECTED: Added the missing '=' sign
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Send' },
    { href: '/history', label: 'History' },
    { href: '/bridge', label: 'Bridge' },
    { href: '/docs', label: 'Docs' },
  ];

  return (
    <>
      <header className="bg-surface/50 backdrop-blur-lg border-b border-secondary/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-text-primary hover:text-primary transition-colors">
                Shroud Protocol
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:block">
              <w3m-button />
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-surface fixed top-16 left-0 right-0 bottom-0 z-40">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-text-primary hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-secondary/30 pt-4 pb-3">
            <div className="flex justify-center">
                <w3m-button />
            </div>
          </div>
        </div>
      )}
    </>
  );
}