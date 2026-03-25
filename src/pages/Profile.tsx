import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Heart, Pill, Phone, Settings, ChevronRight, LogOut, Check, Syringe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Profile = () => {
  const [editingRatio, setEditingRatio] = useState(false);
  const [ratio, setRatio] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("diabesmart_ratio");
    if (saved) setRatio(saved);
  }, []);

  const handleSaveRatio = () => {
    const val = parseFloat(ratio);
    if (!val || val <= 0) {
      toast({ title: "Error", description: "Ingresa un ratio válido (ej: 10)" });
      return;
    }
    localStorage.setItem("diabesmart_ratio", ratio);
    setEditingRatio(false);
    toast({ title: "✅ Ratio guardado", description: `Tu ratio es 1:${val}` });
  };

  const savedRatio = localStorage.getItem("diabesmart_ratio");

  const menuItems = [
    { icon: Heart, label: "Datos de salud", desc: "Tipo de diabetes, peso, edad" },
    { icon: Pill, label: "Medicamentos", desc: "Insulina, metformina" },
    { icon: Phone, label: "Contactos de emergencia", desc: "Doctor, familiar" },
    { icon: Settings, label: "Configuración", desc: "Notificaciones, idioma" },
  ];

  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-foreground mb-6"
      >
        Mi Perfil
      </motion.h1>

      {/* Profile Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-outer p-6 flex items-center gap-5 mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <User size={36} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Oscar Aldana</h2>
          <p className="text-base text-muted-foreground">72 años · Diabetes Tipo 2</p>
          <p className="text-sm text-primary font-semibold mt-1">Perfil completo ✓</p>
        </div>
      </motion.div>

      {/* Health Summary */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[
          { label: "HbA1c", value: "6.8%" },
          { label: "Peso", value: "68 kg" },
          { label: "Promedio", value: "118" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-inner p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Insulin Ratio Setting */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-outer p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Syringe size={20} className="text-primary" />
            <h3 className="text-base font-bold text-foreground">Ratio de Insulina</h3>
          </div>
          {!editingRatio && savedRatio && (
            <button
              onClick={() => setEditingRatio(true)}
              className="text-xs text-primary font-semibold"
            >
              Cambiar
            </button>
          )}
        </div>

        {editingRatio || !savedRatio ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Tu médico te indica cuántos gramos de carbohidratos cubre 1 unidad de insulina.
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Ej: 10"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                min={1}
                max={100}
                className="text-lg h-12 rounded-inner flex-1"
              />
              <button
                onClick={handleSaveRatio}
                className="h-12 px-4 bg-primary text-primary-foreground rounded-inner font-semibold flex items-center gap-1"
              >
                <Check size={16} />
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold text-foreground">
              1 U por cada <span className="text-primary">{savedRatio}g</span> de HC
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Configurado por tu profesional de salud
            </p>
          </div>
        )}
      </motion.div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ x: -15, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="w-full glass-card rounded-inner p-4 flex items-center gap-4 soft-press text-left"
          >
            <div className="w-11 h-11 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon size={22} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-foreground">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Logo + Logout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-10 flex flex-col items-center gap-4"
      >
        <img src={logo} alt="DiabeSmart" className="w-12 h-12 opacity-60" />
        <p className="text-sm text-muted-foreground">DiabeSmart v1.0</p>
        <button className="flex items-center gap-2 text-status-warning font-semibold text-base soft-press py-2 px-4 rounded-button">
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </motion.div>
    </div>
  );
};

export default Profile;
