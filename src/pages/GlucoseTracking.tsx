import { motion } from "framer-motion";
import { Sun, Coffee, Moon, Plus, TrendingUp } from "lucide-react";

const readings = [
  { time: "Mañana", icon: Sun, value: 95, status: "good" as const, hour: "7:30 AM" },
  { time: "Almuerzo", icon: Coffee, value: 142, status: "warning" as const, hour: "12:45 PM" },
  { time: "Cena", icon: Moon, value: null, status: "good" as const, hour: "Pendiente" },
];

const history = [
  { date: "Hoy", avg: 118, readings: 2 },
  { date: "Ayer", avg: 112, readings: 3 },
  { date: "Lunes", avg: 125, readings: 3 },
  { date: "Domingo", avg: 108, readings: 3 },
];

const statusBg = {
  good: "bg-status-good/15 border-status-good/20",
  warning: "bg-status-warning/15 border-status-warning/20",
  danger: "bg-status-danger/15 border-status-danger/20",
};

const GlucoseTracking = () => {
  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-foreground mb-6"
      >
        Seguimiento de Glucosa
      </motion.h1>

      {/* Today's Readings */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-lg font-bold text-foreground mb-3">Hoy</h2>
        <div className="space-y-3">
          {readings.map((r, i) => (
            <motion.div
              key={r.time}
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`glass-card rounded-inner p-4 flex items-center gap-4 soft-press border ${
                r.value ? statusBg[r.status] : "border-border"
              }`}
            >
              <div className="w-12 h-12 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
                <r.icon size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-foreground">{r.time}</p>
                <p className="text-sm text-muted-foreground">{r.hour}</p>
              </div>
              {r.value ? (
                <p className="text-2xl font-bold tabular-nums text-foreground">{r.value}</p>
              ) : (
                <button className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
                  <Plus size={22} className="text-primary" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Historial</h2>
        </div>
        <div className="glass-card rounded-outer overflow-hidden">
          {history.map((day, i) => (
            <div
              key={day.date}
              className={`flex items-center justify-between p-4 ${
                i < history.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div>
                <p className="text-base font-semibold text-foreground">{day.date}</p>
                <p className="text-sm text-muted-foreground">{day.readings} lecturas</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold tabular-nums text-foreground">{day.avg}</p>
                <p className="text-sm text-muted-foreground">promedio</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default GlucoseTracking;
