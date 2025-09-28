import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react'; // icons (optional)
import { usePathname } from 'next/navigation';

const Footer = () => {
    const pathName = usePathname();

    if (pathName === "/inbox") return null;

    return (
        <footer className="bg-gray-900 text-gray-300 py-6 mt-10">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">

                <p className="text-sm text-gray-400">
                    © {new Date().getFullYear()} MyWebsite. All rights reserved.
                </p>

                <div className="flex gap-6 text-sm">
                    <a href="/about" className="hover:text-white">About</a>
                    <a href="/contact" className="hover:text-white">Contact</a>
                    <a href="/privacy" className="hover:text-white">Privacy Policy</a>
                </div>

                <div className="flex gap-4">
                    <a href="https://github.com" target="_blank" rel="noreferrer">
                        <Github className="w-5 h-5 hover:text-white" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer">
                        <Twitter className="w-5 h-5 hover:text-white" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                        <Linkedin className="w-5 h-5 hover:text-white" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;


