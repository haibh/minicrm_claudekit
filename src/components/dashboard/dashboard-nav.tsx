"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "block px-4 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
            )}
        >
            {children}
        </Link>
    );
}

export function DashboardNav() {
    return (
        <nav className="px-4 space-y-1">
            <NavLink href="/overview">Overview</NavLink>
            <NavLink href="/companies">Companies</NavLink>
            <NavLink href="/contacts">Contacts</NavLink>
            <NavLink href="/deals">Deals</NavLink>
            <NavLink href="/activities">Activities</NavLink>
        </nav>
    );
}
