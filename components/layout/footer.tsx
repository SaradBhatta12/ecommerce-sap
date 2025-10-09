import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 py-16 transition-colors duration-300">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Navigation */}
          <div className="space-y-8">
            <nav className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Shop</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/men" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                      Men
                    </Link>
                  </li>
                  <li>
                    <Link href="/women" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                      Women
                    </Link>
                  </li>
                  <li>
                    <Link href="/accessories" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                      Accessories
                    </Link>
                  </li>
                  <li>
                    <Link href="/sale" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                      Sale
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">Support</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/shipping" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                      Shipping
                    </Link>
                  </li>
                  <li>
                    <Link href="/returns" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                      Returns
                    </Link>
                  </li>
                  <li>
                    <Link href="/size-guide" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                      Size Guide
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
            
            {/* Social Links */}
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                Instagram
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                Twitter
              </Link>
              <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors text-sm">
                Facebook
              </Link>
            </div>
          </div>

          {/* Right Side - XIV QR Logo */}
          <div className="flex justify-center lg:justify-end">
            <div className="text-center">
              <div className="text-8xl lg:text-9xl font-bold text-black dark:text-white leading-none transition-colors duration-300">
                XIV
                <br />
                QR
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} XIV QR. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
