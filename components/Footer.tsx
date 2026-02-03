
import React from 'react';

const Footer: React.FC = () => {
  const links = [
    'Meta', 'About', 'Blog', 'Jobs', 'Help', 'API', 'Privacy', 'Terms', 'Locations', 'Instagram Lite', 'Threads', 'Contact Uploading & Non-Users', 'Meta Verified'
  ];

  return (
    <footer className="w-full max-w-[1060px] px-4 py-8 flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-4 gap-y-2 mb-4">
        {links.map((link) => (
          <a key={link} href="#" className="text-[11px] md:text-xs text-[#8e8e8e] hover:underline whitespace-nowrap">
            {link}
          </a>
        ))}
      </div>
      
      <div className="flex items-center space-x-4 text-[11px] md:text-xs text-[#8e8e8e]">
        <select className="bg-transparent border-none outline-none cursor-pointer">
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
        <span>© 2024 Instagram from Meta</span>
      </div>
    </footer>
  );
};

export default Footer;
