import Link from 'next/link';
import React from 'react';

interface Props {
  title: string;
  icon: React.ReactNode;
  isActive?: boolean;
  href?: string;
  onClick?: () => void;
}

const SidebarItem = ({ title, icon, isActive, href, onClick }: Props) => {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
  };

  return href ? (
    <Link href={href} className="my-2 block">
      <div
        className={`flex gap-2 min-h-12 h-full items-center px-[13px] rounded-md transition-colors
        ${isActive ? 'bg-purple-800/60 text-purple-300'
            : 'hover:bg-purple-900/40 hover:text-purple-200 text-gray-300'}`}
        onClick={handleClick}
      >
        {icon}
        <h5 className="text-lg">{title}</h5>
      </div>
    </Link>
  ) : (
    <div
      className={`flex gap-2 min-h-12 h-full items-center px-[13px] rounded-md transition-colors
      ${isActive ? 'bg-purple-800/60 text-purple-300'
          : 'hover:bg-purple-900/40 hover:text-purple-200 text-gray-300'}`}
      onClick={handleClick}
    >
      {icon}
      <h5 className="text-lg">{title}</h5>
    </div>
  );
};

export default SidebarItem;
