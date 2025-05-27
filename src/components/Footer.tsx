
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-sage-900 text-sage-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/lovable-uploads/e7ebc54a-3544-46fa-888c-a469076505c8.png" 
                alt="Happy Flower Logo" 
                className="h-8 w-8"
              />
              <span className="font-serif text-xl font-semibold">Happy Flower</span>
            </div>
            <p className="text-sage-300 text-sm leading-relaxed mb-4">
              Bringing joy through beautiful flowers and AI-powered personalized recommendations.
            </p>
            <div className="flex items-center gap-2 text-sm text-sage-300">
              <Heart className="h-4 w-4 text-coral-400" />
              <span>Made with love since 2024</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sage-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-sage-300 hover:text-coral-400 transition-colors text-sm">Home</a></li>
              <li><a href="#flowers" className="text-sage-300 hover:text-coral-400 transition-colors text-sm">Our Flowers</a></li>
              <li><a href="#ai-expert" className="text-sage-300 hover:text-coral-400 transition-colors text-sm">AI Expert</a></li>
              <li><a href="#about" className="text-sage-300 hover:text-coral-400 transition-colors text-sm">About Us</a></li>
              <li><a href="#contact" className="text-sage-300 hover:text-coral-400 transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-sage-100 mb-4">Services</h3>
            <ul className="space-y-2">
              <li><span className="text-sage-300 text-sm">Fresh Bouquets</span></li>
              <li><span className="text-sage-300 text-sm">Custom Arrangements</span></li>
              <li><span className="text-sage-300 text-sm">Wedding Flowers</span></li>
              <li><span className="text-sage-300 text-sm">Corporate Events</span></li>
              <li><span className="text-sage-300 text-sm">Same-Day Delivery</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-sage-100 mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-coral-400 shrink-0" />
                <span className="text-sage-300 text-sm">123 Flower Street, Garden City, CA 90210</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-coral-400 shrink-0" />
                <span className="text-sage-300 text-sm">(555) 123-FLOWER</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-coral-400 shrink-0" />
                <span className="text-sage-300 text-sm">hello@happyflower.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-sage-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sage-400 text-sm">
              © 2024 Happy Flower. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="text-sage-400 hover:text-coral-400 transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-sage-400 hover:text-coral-400 transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-sage-400 hover:text-coral-400 transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
