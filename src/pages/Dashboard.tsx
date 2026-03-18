import { motion } from "framer-motion";
import { Clock, Droplets, Utensils, Syringe } from "lucide-react";
import GlucoseCircle from "@/components/GlucoseCircle";
import DarkModeToggle from "@/components/DarkModeToggle";
import logo from "@/assets/logo.png";

const Dashboard = () => {
  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 mb-8"
      >
        <img src={logo} alt="DiabeSmart" className="w-11 h-11 rounded-full" />
        <div>
          <p className="text-base text-muted-foreground font-medium">Buenos días</p>
          <h1 className="text-2xl font-bold text-foreground">Oscar Aldana</h1>
        </div>
      </motion.div>

      {/* Glucose Circle */}
      <div className="flex justify-center mb-8">
        <GlucoseCircle value={104} status="good" />
      </div>

      {/* Time indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-2 mb-8 text-muted-foreground"
      >
        <Clock size={18} />
        <span className="text-base font-medium">Última lectura: hace 15 min</span>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-outer p-5 soft-press cursor-pointer"
        >
          <div className="w-11 h-11 rounded-inner bg-primary/15 flex items-center justify-center mb-3">
            <Utensils size={22} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Última comida</p>
          <p className="text-xl font-bold text-foreground mt-1">1h atrás</p>
          <p className="text-sm text-muted-foreground mt-1">Arroz con pollo</p>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-outer p-5 soft-press cursor-pointer"
        >
          <div className="w-11 h-11 rounded-inner bg-secondary/40 flex items-center justify-center mb-3">
            <Syringe size={22} className="text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Próxima dosis</p>
          <p className="text-xl font-bold text-foreground mt-1">8:00 PM</p>
          <p className="text-sm text-muted-foreground mt-1">Insulina rápida</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-outer p-5"
      >
        <h2 className="text-lg font-bold text-foreground mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="soft-press bg-primary text-primary-foreground rounded-button py-4 text-base font-semibold flex items-center justify-center gap-2">
            <Droplets size={20} />
            Registrar glucosa
          </button>
          <button className="soft-press bg-secondary text-secondary-foreground rounded-button py-4 text-base font-semibold flex items-center justify-center gap-2">
            <Syringe size={20} />
            Calcular dosis
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
