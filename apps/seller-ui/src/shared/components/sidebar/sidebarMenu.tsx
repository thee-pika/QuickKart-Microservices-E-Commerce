import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}
const SidebarMenu = ({ title, children }: Props) => {
  return (
    <div className="block">
          <h3 className="px-3 mx-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
};

export default SidebarMenu;
