'use client';

import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar';
import {
  BadgeIndianRupee,
  BellPlus,
  CalendarPlus,
  Headset,
  HomeIcon,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings2,
  SquarePlus,
  TicketPercent,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SidebarItem from './sidebarItem';
import SidebarMenu from './sidebarMenu';
import { useQueryClient } from '@tanstack/react-query';
import toast, { Toaster } from "react-hot-toast";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathname = usePathname();
  const { seller } = useSeller();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? '#C084FC' : '#9CA3AF';

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    queryClient.invalidateQueries();
    toast.success("LogOut Successfull!!")
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  }

  return (
    <aside className="w-72 h-screen bg-gradient-to-b bg-black border-r border-purple-800 flex flex-col shadow-lg">
      <Link
        href="/"
        className="flex flex-col items-center gap-1 px-4 py-6 border-b border-purple-800 bg-gradient-to-r from-purple-900/50 via-black to-purple-900/50"
      >
        <h3 className="text-xl font-bold text-purple-300 truncate max-w-[200px]">
          {seller?.shop?.name || 'Shop Name'}
        </h3>
        <p className="text-xs font-medium text-gray-400 truncate max-w-[200px]">
          {seller?.shop?.address || 'No Shop Address'}
        </p>
      </Link>

      <div className="flex-1 ">
        <SidebarItem
          title="Dashboard"
          icon={<HomeIcon fill={getIconColor('/dashboard')} />}
          isActive={activeSidebar === '/dashboard'}
          href="/dashboard"
        />

        <SidebarMenu title="Main Menu">
          <SidebarItem
            title="Orders"
            icon={
              <ListOrdered
                size={22}
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
                size={22}
                fill={getIconColor('/dashboard/payments')}
              />
            }
            isActive={activeSidebar === '/dashboard/payments'}
            href="/dashboard/payments"
          />
        </SidebarMenu>

        <SidebarMenu title="Products">
          <SidebarItem
            title="Create Product"
            icon={
              <SquarePlus
                size={20}
                fill={getIconColor('/dashboard/create-product')}
              />
            }
            isActive={activeSidebar === '/dashboard/create-product'}
            href="/dashboard/create-product"
          />
          <SidebarItem
            title="All Products"
            icon={
              <PackageSearch
                size={20}
                fill={getIconColor('/dashboard/all-products')}
              />
            }
            isActive={activeSidebar === '/dashboard/all-products'}
            href="/dashboard/all-products"
          />
        </SidebarMenu>

        <SidebarMenu title="Events">
          <SidebarItem
            title="Create Event"
            icon={
              <CalendarPlus
                size={20}
                fill={getIconColor('/dashboard/create-event')}
              />
            }
            isActive={activeSidebar === '/dashboard/create-event'}
            href="/dashboard/create-event"
          />
          <SidebarItem
            title="All Events"
            icon={
              <BellPlus
                size={20}
                fill={getIconColor('/dashboard/all-events')}
              />
            }
            isActive={activeSidebar === '/dashboard/all-events'}
            href="/dashboard/all-events"
          />
        </SidebarMenu>

        <SidebarMenu title="Controllers">
          <SidebarItem
            title="Inbox"
            icon={<Mail size={20} fill={getIconColor('/dashboard/inbox')} />}
            isActive={activeSidebar === '/dashboard/inbox'}
            href="/dashboard/inbox"
          />
          <SidebarItem
            title="Settings"
            icon={
              <Settings2
                size={20}
                fill={getIconColor('/dashboard/settings')}
              />
            }
            isActive={activeSidebar === '/dashboard/settings'}
            href="/dashboard/settings"
          />
          <SidebarItem
            title="Notifications"
            icon={
              <Headset
                size={20}
                fill={getIconColor('/dashboard/notifications')}
              />
            }
            isActive={activeSidebar === '/dashboard/notifications'}
            href="/dashboard/notifications"
          />
        </SidebarMenu>

        <SidebarMenu title="Extras">

          <SidebarItem
            title="Logout"
            icon={
              <LogOut size={20} fill={getIconColor('/dashboard/logout')} />
            }
            isActive={activeSidebar === '/dashboard/logout'}
            href="/dashboard/logout"
            onClick={handleLogout}
          />
          <SidebarItem
            title="Back to Home"
            icon={
              <TicketPercent
                size={20}
                fill={getIconColor('/')}
              />
            }
            isActive={activeSidebar === '/'}
            href="/"
          />
        </SidebarMenu>
      </div>
      <Toaster />
    </aside>
  );
};

export default SidebarWrapper;
