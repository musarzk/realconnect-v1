// components/AdminTabs.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminTabs() {
    const pathname = usePathname();
    const tabs = [
        { href: "/admin/properties", label: "Properties" },
        { href: "/admin/bookings", label: "Bookings" },
        { href: "/admin/messages", label: "Messages" },
    ];

    return (
        <div className="flex border-b mb-4">
            {tabs.map((tab) => (
                <Link
                    key={tab.href}
                    href={tab.href}
                    className={`px-4 py-2 -mb-px border-b-2 ${pathname === tab.href ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}
