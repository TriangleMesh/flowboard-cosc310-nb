"use client";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SettingsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go";
import React from "react";

const routes = [
    {
        label: "Home",
        href: "", // Changed to avoid URL issues
        icon: GoHome,
        activeIcon: GoHomeFill,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: SettingsIcon,
        activeIcon: SettingsIcon,
    },
    {
        label: "Members",
        href: "/members",
        icon: UsersIcon,
        activeIcon: UsersIcon,
    },
    {
        label: "Admin Dashboard",
        href: "/admin-dashboard",
        icon: GoCheckCircle,
        activeIcon: GoCheckCircleFill,
    },
];

export const Navigation = () => {
    const workspaceId = useWorkspaceId();
    const pathname = usePathname();

    //  Prevent rendering until `workspaceId` is available
    if (!workspaceId) {
        return <p>Loading workspace...</p>;
    }

    return (
        <ul className="flex flex-col">
            {routes.map((item) => {
                const fullHref = `/workspaces/${workspaceId}${item.href}`;
                const isActive = pathname.startsWith(fullHref);

                const Icon = isActive ? item.activeIcon : item.icon;

                return (
                    <li key={item.href}>
                        <Link href={fullHref} aria-current={isActive ? "page" : undefined}>
                            <div className={cn(
                                "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-neutral-700",
                                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                            )}>
                                <Icon className="size-5 text-neutral-500" />
                                {item.label}
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};
