import { Home, BookOpen, Camera, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Inicio", path: "/" },
  { icon: BookOpen, label: "Registro", path: "/glucose" },
  { icon: Camera, label: "Comida IA", path: "/food" },
  { icon: Bell, label: "Alertas", path: "/alerts" },
  { icon: User, label: "Perfil", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="soft-press flex flex-col items-center gap-1 py-2 px-3 rounded-inner relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-inner"
                  transition={{ type: "spring", duration: 0.4 }}
                />
              )}
              <item.icon
                size={24}
                className={isActive ? "text-primary" : "text-muted-foreground"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
