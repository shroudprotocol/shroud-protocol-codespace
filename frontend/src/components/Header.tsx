import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-surface/50 backdrop-blur-lg border-b border-secondary/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-text-primary hover:text-primary transition-colors">
              Shroud Protocol
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                Send
              </Link>
              <Link href="/history" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                History
              </Link>
              <Link href="/bridge" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                Bridge
              </Link>
              <Link href="/docs" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                Docs
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            {/* Replace the static button with Web3Modal's component */}
            <w3m-button />
          </div>
        </div>
      </div>
    </header>
  );
}