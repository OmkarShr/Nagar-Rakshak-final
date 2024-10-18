import React from 'react';
import { PlusCircle, MessageSquare, Shield, BookOpen, Mail, LogOut, Trash2 } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
}

interface SidebarProps {
  chats: Chat[];
  currentChat: string | null;
  setCurrentChat: (chatId: string | null) => void;
  onEmailClick: () => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, currentChat, setCurrentChat, onEmailClick, onNewChat, onDeleteChat }) => {
  return (
    <aside className="w-64 bg-[#1A2B4B] flex flex-col text-white">
      <div className="p-4 flex items-center space-x-2">
        <img src="/nagar-rakshak-avatar.png" alt="Nagar Rakshak Logo" className="w-8 h-8" />
        <h1 className="text-xl font-serif font-bold text-[#FFD700]">Nagar Rakshak</h1>
      </div>
      <button
        onClick={onNewChat}
        className="m-4 p-3 bg-[#2A3B5B] text-[#FFD700] rounded-md hover:bg-[#3A4B6B] transition-colors flex items-center space-x-2 font-semibold"
      >
        <PlusCircle size={20} />
        <span>New inquiry</span>
      </button>
      <div className="flex-grow overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`w-full p-3 text-left hover:bg-[#2A3B5B] transition-colors flex items-center justify-between ${
              currentChat === chat.id ? 'bg-[#2A3B5B]' : ''
            }`}
          >
            <button
              onClick={() => setCurrentChat(chat.id)}
              className="flex items-center space-x-2 flex-grow"
            >
              <MessageSquare size={20} />
              <span className="truncate">{chat.name}</span>
            </button>
            <button
              onClick={() => onDeleteChat(chat.id)}
              className="text-gray-400 hover:text-[#FFD700] transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-[#2A3B5B] space-y-2">
        <button 
          onClick={onEmailClick}
          className="w-full p-2 hover:bg-[#2A3B5B] transition-colors rounded-md flex items-center space-x-2"
        >
          <Mail size={20} />
          <span>Email Report</span>
        </button>
        <button className="w-full p-2 hover:bg-[#2A3B5B] transition-colors rounded-md flex items-center space-x-2">
          <Shield size={20} />
          <span>Police Resources</span>
        </button>
        <button className="w-full p-2 hover:bg-[#2A3B5B] transition-colors rounded-md flex items-center space-x-2">
          <BookOpen size={20} />
          <span>Learn More</span>
        </button>
        <button className="w-full p-2 hover:bg-[#2A3B5B] transition-colors rounded-md flex items-center space-x-2">
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
