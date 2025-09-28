import Link from 'next/link';
import React from 'react';

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href: string;
  onClick?: () => void;
}

const SidebarItem = ({ title, icon, isActive, href, onClick }: Props) => {
  return (
    <Link href={href} className="my-2 block">
      <div
        className={`flex gap-2 mx- min-h-12 h-full items-center px-[13px] rounded-md transition-colors
          ${isActive ? 'bg-purple-800/60 text-purple-300'
            : 'hover:bg-purple-900/40 hover:text-purple-200 text-gray-300'}
        `}
        onClick={onClick}
      >
        {icon}
        <h5 className="text-lg">{title}</h5>
      </div>
    </Link>
  );
};

export default SidebarItem;
