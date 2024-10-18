import React from 'react';
import { Mail } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  onEmailClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onEmailClick }) => {
  return (
    <header className="bg-gray-800 text-white p-4 border-b border-gray-700">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Logo size={48} />
          <h1 className="text-2xl font-bold">Legal-Eaze</h1>
        </div>
        <button
          onClick={onEmailClick}
          className="text-gray-300 hover:text-white flex items-center space-x-2 transition-colors"
        >
          <Mail size={20} />
          <span className="text-sm">Email Summary</span>
        </button>
      </div>
    </header>
  );
};

export default Header;