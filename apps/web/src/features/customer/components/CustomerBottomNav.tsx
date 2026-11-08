import { NavLink } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  ClipboardList,
  UserRound,
  PartyPopper,
} from "lucide-react";

interface CustomerBottomNavProps {
  outletId: string;
}

export default function CustomerBottomNav({
  outletId,
}: CustomerBottomNavProps) {
  const customerHome = `/customer/${outletId}`;

  const navItems = [
    {
      label: "Home",
      to: customerHome,
      icon: Home,
      end: true,
    },
    {
      label: "Party",
      to: `${customerHome}/party`,
      icon: PartyPopper,
      end: false,
    },
    {
      label: "Cart",
      to: "/cart",
      icon: ShoppingCart,
      state: { returnTo: customerHome },
      end: false,
    },
    {
      label: "Orders",
      to: `${customerHome}/orders`,
      icon: ClipboardList,
      state: { returnTo: customerHome },
      end: false,
    },
    {
      label: "Profile",
      to: `${customerHome}/profile`,
      icon: UserRound,
      state: { returnTo: customerHome },
      end: false,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ label, to, icon: Icon, state, end }) => (
          <NavLink
            key={label}
            to={to}
            state={state}
            end={end}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-1 rounded-xl px-3 py-1 text-xs font-medium transition ${
                isActive
                  ? "text-orange-600"
                  : "text-stone-500 hover:text-orange-600"
              }`
            }
          >
            <Icon size={21} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}