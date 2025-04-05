import { Link } from 'wouter';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted py-10 px-4 md:px-6 mt-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="text-primary font-heading font-bold text-3xl">
              StreamVerse
            </Link>
            <p className="text-muted-foreground mt-4 max-w-md">
              Watch unlimited movies, TV shows, and anime on your phone, tablet, laptop, and TV without paying more.
            </p>
            <div className="flex mt-6 space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-foreground font-medium mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link></li>
                <li><Link href="/movies" className="text-muted-foreground hover:text-foreground">Movies</Link></li>
                <li><Link href="/anime" className="text-muted-foreground hover:text-foreground">Anime</Link></li>
                <li><Link href="/new" className="text-muted-foreground hover:text-foreground">New Releases</Link></li>
                <li><Link href="/popular" className="text-muted-foreground hover:text-foreground">Popular</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-foreground font-medium mb-4">Categories</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Action</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Adventure</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Comedy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Drama</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Horror</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-foreground font-medium mb-4">Account</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">My Account</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Watchlist</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Recently Viewed</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Settings</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-foreground font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Use</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Cookie Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">DMCA</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2023 StreamVerse. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              {/* Payment method icons would go here */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
