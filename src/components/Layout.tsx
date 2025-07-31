import { Outlet } from "react-router-dom";
import { Navigation, UserProfile } from "./ui/navigation";

export function Layout() {
  return (
    <div className="min-h-screen bg-background geometric-bg">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-card/50 border-r border-border backdrop-blur-sm">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-neon flex items-center justify-center">
                  <span className="text-background font-bold text-sm">IE</span>
                </div>
                <span className="text-xl font-bold text-neon">Inference Exchange</span>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4">
              <UserProfile email="user@example.com" plan="Pro" />
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4 pb-4">
              <Navigation />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}