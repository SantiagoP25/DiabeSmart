import { motion } from "framer-motion";
import { Bell, Clock, Syringe, Droplets, Phone, CheckCircle2 } from "lucide-react";

const reminders = [
  { icon: Droplets, title: "Medir glucosa", time: "6:00 PM", active: true },
  { icon: Syringe, title: "Dosis de insulina", time: "8:00 PM", active: true },
  { icon: Clock, title: "Tomar medicamento", time: "9:00 PM", active: false },
];

const alerts = [
  {
    type: "warning" as const,
    title: "Glucosa elevada detectada",
    desc: "Tu lectura del almuerzo fue 142 mg/dL. Recuerda beber agua.",
    time: "Hace 2h",
  },
  {
    type: "good" as const,
    title: "¡Buen trabajo!",
    desc: "Tu promedio semanal mejoró un 5%.",
    time: "Hace 1 día",
  },
];

const alertStyles = {
  warning: "border-status-warning/25 bg-status-warning/8",
  good: "border-status-good/25 bg-status-good/8",
};

const Alerts = () => {
  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 mb-6"
      >
        <Bell size={26} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Alertas y Recordatorios</h1>
      </motion.div>

      {/* Reminders */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-lg font-bold text-foreground mb-3">Recordatorios de hoy</h2>
        <div className="space-y-3">
          {reminders.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card rounded-inner p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
                <r.icon size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.time}</p>
              </div>
              {r.active ? (
                <div className="w-5 h-5 rounded-full bg-primary" />
              ) : (
                <CheckCircle2 size={22} className="text-muted-foreground" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Alerts */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-lg font-bold text-foreground mb-3">Notificaciones</h2>
        <div className="space-y-3">
          {alerts.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className={`rounded-inner p-5 border ${alertStyles[a.type]}`}
            >
              <p className="text-base font-bold text-foreground">{a.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
              <p className="text-xs text-muted-foreground mt-2">{a.time}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Emergency */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full glass-card rounded-outer p-5 soft-press flex items-center justify-center gap-3 border-2 border-status-warning/30"
      >
        <Phone size={24} className="text-status-warning" />
        <span className="text-xl font-bold text-foreground">Llamar al Doctor</span>
      </motion.button>
    </div>
  );
};

export default Alerts;
