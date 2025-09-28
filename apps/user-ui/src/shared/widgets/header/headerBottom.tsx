import MenuComponent from 'apps/user-ui/src/app/icons/svgs/menu';
import { headerItems } from 'apps/user-ui/src/configs/constants';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const HeaderBottom = () => {
  return (
    <div className="w-[60%] mx-auto flex justify-between items-center">
      <div className="bg-[#345635] px-4 py-3">
        <span className="text-gray-50 flex gap-4 font-[500]">
          <MenuComponent /> All Departments <ChevronDown className="ml-4" />
        </span>
      </div>
      <div className="flex items-center gap-2 ">
        {headerItems.map((item: any, index: number) => (
          <Link href={item.href} key={index}>
            <span
              key={index}
              className=" px-4 py-3 font-semibold hover:underline cursor-pointer"
            >
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HeaderBottom;
