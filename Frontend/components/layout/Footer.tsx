'use client';

import Link from 'next/link';
// import { Facebook, Instagram, Youtube } from 'lucide-react';
import { FaCcVisa, FaCcMastercard,FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { LiaCcAmex } from "react-icons/lia";


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/hooks/useTranslation';

export default function Footer(): React.JSX.Element {
  const { t } = useTranslation();
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t mt-20">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-xl mb-5 text-gray-900">{t('about')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              At AVE Catering, you can score wholesale savings on big name brands and have them delivered directly to your door.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" asChild className="group border-gray-300 hover:border-blue-600 transition-all duration-200">
                <Link href="#" aria-label="Facebook">
                  <FaFacebookF  className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild className='group border-gray-300 hover:border-pink-500 transition-all duration-200'>
                <Link href="#" aria-label="Instagram">
                  <FaInstagram  className="h-4 w-4 text-gray-600 group-hover:text-pink-500 transition-colors duration-200" />
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild className="group border-gray-300 hover:border-red-600 transition-all duration-200">
                <Link href="#" aria-label="YouTube">
                  <FaYoutube  className="h-4 w-4 text-gray-600 group-hover:text-red-600 transition-colors duration-200" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-xl mb-5">{t('categories')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary transition">
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link href="/deals" className="text-muted-foreground hover:text-primary transition">
                  {t('deals')}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-primary transition">
                  {t('categories')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition">
                  {t('about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-xl mb-5">Customer Service</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-primary transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-primary transition">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-xl mb-5">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Get first dibs on exclusive promotions and discounts.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1 focus:border-primary focus:ring-primary"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
                Subscribe
              </Button>
            </div>
            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-2 font-medium">We accept</p>
              <div className="flex gap-3 items-center">
                 <FaCcVisa className="text-4xl text-gray-600 hover:text-primary transition-colors duration-200" />
                <FaCcMastercard className="text-4xl text-gray-600 hover:text-primary transition-colors duration-200" />
                <LiaCcAmex className="text-4xl text-gray-600 hover:text-primary transition-colors duration-200" />
             
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AVE Catering. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Terms & Conditions
              </Link>
            </div>
          </div>
          <p className="text-center mt-6 text-xs text-muted-foreground">
            You can reach us at <a href="mailto:help@avecatering.com" className="text-primary hover:underline">help@avecatering.com</a> or <a href="tel:3232503212" className="text-primary hover:underline">(323) 250-3212</a> Monday-Saturday (7am-7pm PT)
          </p>
        </div>
      </div>
    </footer>
  );
}
