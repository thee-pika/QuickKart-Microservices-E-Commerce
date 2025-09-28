'use client';
import { useQueryClient } from '@tanstack/react-query';
import {
  BadgeIndianRupee,
  CalendarPlus,
  Headset,
  HomeIcon,
  ListOrdered,
  LogOut,
  PackageSearch,
  ShieldUser,
  SquarePlus,
  TicketPercent
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useAdmin from '../../hooks/useAdmin';
import useSidebar from '../../hooks/useSidebar';
import SidebarItem from './sidebarItem';
import SidebarMenu from './sidebarMenu';

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathname = usePathname();
  const { admin, isLoading } = useAdmin();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#e8f0eb' : '#bbd2c5';

  const handleLogout = (e?: React.MouseEvent) => {
    e?.preventDefault();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    queryClient.invalidateQueries();
    toast.success("LogOut Successfull!!")
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  }

  return (
    <aside className="w-72 min-h-screen bg-gradient-to-b bg-black border-r border-purple-800 flex flex-col shadow-lg">
      <Link
        href="/"
        className="flex flex-col items-center gap-2 px-4 py-5 border-b border-purple-800"
      >
        <div className='flex flex-col items-center'>
          <ShieldUser fill='#E8F0EB' className='w-10 h-10' />
          <h3 className="text-2xl font-bold text-purple-800">
            {admin?.name || 'admin name'}
          </h3>
        </div>
        <p className="text-sm font-semibold text-purple-800 truncate">
          {admin?.email || 'No email '}
        </p>
        <span className='text-gray-100'> Admin</span>
      </Link>

      <div className="block my-3 h-full">
        <div>
          <SidebarItem
            title="Dashboard"
            icon={<HomeIcon fill={getIconColor('/dashboard')} />}
            isActive={activeSidebar === '/dashboard'}
            href="/dashboard"
          />
        </div>

        <div className="mt-2 block">
          <SidebarMenu title="Main Menu">
            <SidebarItem
              title="Orders"
              icon={
                <ListOrdered
                  size={26}
                  fill={getIconColor('/dashboard/orders')}
                />
              }
              isActive={activeSidebar === '/dashboard/orders'}
              href="/dashboard/orders"
            />
            <SidebarItem
              title="Payments"
              icon={
                <BadgeIndianRupee
                  size={26}
                  fill={getIconColor('/dashboard/payments')}
                />
              }
              isActive={activeSidebar === '/dashboard/payments'}
              href="/dashboard/payments"
            />
            <SidebarItem
              title="Products"
              icon={
                <PackageSearch
                  size={22}
                  fill={getIconColor('/dashboard/all-products')}
                />
              }
              isActive={activeSidebar === '/dashboard/all-products'}
              href="/dashboard/all-products"
            />
            <SidebarItem
              title="Events"
              icon={
                <CalendarPlus
                  size={24}
                  fill={getIconColor('/dashboard/events')}
                />
              }
              isActive={activeSidebar === '/dashboard/events'}
              href="/dashboard/events"
            />
            <SidebarItem
              title="Users"
              icon={
                <CalendarPlus
                  size={24}
                  fill={getIconColor('/dashboard/users')}
                />
              }
              isActive={activeSidebar === '/dashboard/users'}
              href="/dashboard/users"
            />
            <SidebarItem
              title="Sellers"
              icon={
                <CalendarPlus
                  size={24}
                  fill={getIconColor('/dashboard/sellers')}
                />
              }
              isActive={activeSidebar === '/dashboard/sellers'}
              href="/dashboard/sellers"
            />
          </SidebarMenu>

          <SidebarMenu title="Controllers">
            <SidebarItem
              title="Loggers"
              icon={
                <SquarePlus
                  size={24}
                  fill={getIconColor('/dashboard/loggers')}
                />
              }
              isActive={activeSidebar === '/dashboard/loggers'}
              href="/dashboard/loggers"
            />
            <SidebarItem
              title="Notifications"
              icon={
                <Headset
                  size={24}
                  fill={getIconColor('/dashboard/notifications')}
                />
              }
              isActive={activeSidebar === '/dashboard/notifications'}
              href="/dashboard/notifications"
            />
          </SidebarMenu>
          <SidebarMenu title="Customization">
            <SidebarItem
              title="All Customization"
              icon={
                <TicketPercent
                  size={24}
                  fill={getIconColor('/dashboard/customization')}
                />
              }
              isActive={activeSidebar === '/dashboard/customization'}
              href="/dashboard/customization"
            />
          </SidebarMenu>
          <SidebarMenu title="Extras">
            <button
              onClick={handleLogout}
              className="flex gap-2 min-h-12 h-full items-center px-[13px] rounded-md 
  hover:bg-purple-900/40 hover:text-purple-200 text-gray-300"
            >
              <LogOut size={20} fill={getIconColor('/dashboard/logout')} />
              <h5 className="text-lg">Logout</h5>
            </button>
          </SidebarMenu>
        </div>
      </div>
      <Toaster />
    </aside>
  );
};

export default SidebarWrapper;
