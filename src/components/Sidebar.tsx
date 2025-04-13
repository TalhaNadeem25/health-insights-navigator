import { NavLink } from "react-router-dom";
import { BarChart3, FileText, Home, Upload, Users, Server, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/dashboard", label: "Risk Dashboard", icon: BarChart3 },
  { path: "/risk-assessment", label: "Risk Assessment", icon: Users },
  { path: "/data-upload", label: "Data Upload", icon: Upload },
  { path: "/resource-optimization", label: "Resource Optimization", icon: FileText },
  { path: "/model-deployment", label: "Model Deployment", icon: Server },
  { path: "/settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed md:static inset-y-0 left-0 z-40 transform md:transform-none transition-transform duration-200 ease-in-out bg-card border-r w-64 md:flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="hidden md:flex h-16 items-center px-4 border-b">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-health-600 text-white font-bold">
            H+
          </div>
          <span className="font-semibold text-lg">HealthInsights</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-health-600 text-white"
                  : "text-foreground hover:bg-muted"
              )
            }
            end={item.path === "/"}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p>HealthInsights v1.0.0</p>
          <p>© 2025 HealthInsights</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
