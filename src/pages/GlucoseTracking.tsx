import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Coffee, Moon, Utensils, TrendingUp, Droplets, Syringe, Trash2, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface GlucoseRecord {
  glucose: number;
  meal: string;
  insulinUnits: number;
  timestamp: string;
}

const STORAGE_KEY = "diabesmart_records";
const PROFILE_KEY = "diabesmart_health_profile";

const getRecords = (): GlucoseRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const mealIcon = (meal: string) => {
  switch (meal) {
    case "Desayuno": return Sun;
    case "Almuerzo": return Coffee;
    case "Comida": return Utensils;
    default: return Moon;
  }
};

const glucoseStatus = (val: number) => {
  if (val < 60) return "danger";
  if (val > 180) return "danger";
  if (val > 140) return "warning";
  return "good";
};

const statusBg: Record<string, string> = {
  good: "bg-status-good/15 border-status-good/20",
  warning: "bg-status-warning/15 border-status-warning/20",
  danger: "bg-status-danger/15 border-status-danger/20",
};

const GlucoseTracking = () => {
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [range, setRange] = useState<{ min: number; max: number }>({ min: 70, max: 180 });

  useEffect(() => {
    setRecords(getRecords());
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setRange({
          min: parseInt(p.rangeMin) || 70,
          max: parseInt(p.rangeMax) || 180,
        });
      }
    } catch { /* noop */ }
  }, []);

  // Time in range stats
  const inRange = records.filter(r => r.glucose >= range.min && r.glucose <= range.max).length;
  const below = records.filter(r => r.glucose < range.min).length;
  const above = records.filter(r => r.glucose > range.max).length;
  const total = records.length;
  const pctIn = total ? Math.round((inRange / total) * 100) : 0;
  const pctBelow = total ? Math.round((below / total) * 100) : 0;
  const pctAbove = total ? 100 - pctIn - pctBelow : 0;

  const pieData = [
    { name: "En rango", value: pctIn },
    { name: "Sobre rango", value: pctAbove },
    { name: "Bajo rango", value: pctBelow },
  ].filter(d => d.value > 0);

  const PIE_COLORS = ["hsl(145, 45%, 45%)", "hsl(30, 80%, 55%)", "hsl(0, 65%, 55%)"];

  // Bar chart: last 7 days averages
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, "yyyy-MM-dd");
    const dayRecs = records.filter(r => format(new Date(r.timestamp), "yyyy-MM-dd") === key);
    const avg = dayRecs.length ? Math.round(dayRecs.reduce((s, r) => s + r.glucose, 0) / dayRecs.length) : 0;
    return { day: format(d, "EEE", { locale: es }).slice(0, 3), promedio: avg };
  });

  const handleDelete = (index: number) => {
    const updated = records.filter((_, i) => i !== index);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setRecords(updated);
  };

  // Group by date
  const grouped = records.reduce<Record<string, GlucoseRecord[]>>((acc, r) => {
    const dateKey = format(new Date(r.timestamp), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(r);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const formatDateLabel = (dateKey: string) => {
    const d = new Date(dateKey);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Hoy";
    if (d.toDateString() === yesterday.toDateString()) return "Ayer";
    return format(d, "EEEE d 'de' MMMM", { locale: es });
  };

  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        Mis Registros
      </motion.h1>
      <p className="text-sm text-muted-foreground mb-6">
        {records.length} registros guardados
      </p>

      {records.length === 0 ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center py-16"
        >
          <Droplets size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Sin registros aún</p>
          <p className="text-sm text-muted-foreground mt-1">
            Usa "Registrar glucosa" en el Dashboard para empezar
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dayRecords = grouped[dateKey];
            const avg = Math.round(dayRecords.reduce((s, r) => s + r.glucose, 0) / dayRecords.length);

            return (
              <motion.div
                key={dateKey}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-foreground capitalize">{formatDateLabel(dateKey)}</h2>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingUp size={14} />
                    <span>Promedio: <span className="font-bold text-foreground">{avg}</span></span>
                  </div>
                </div>

                <div className="space-y-2">
                  {dayRecords
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((record, i) => {
                      const Icon = mealIcon(record.meal);
                      const status = glucoseStatus(record.glucose);
                      const globalIdx = records.indexOf(record);

                      return (
                        <motion.div
                          key={i}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className={`glass-card rounded-inner p-4 flex items-center gap-4 border ${statusBg[status]}`}
                        >
                          <div className="w-11 h-11 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon size={22} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-foreground">{record.meal}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(record.timestamp), "h:mm a")}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Droplets size={14} className="text-primary" />
                              <span className="text-xl font-bold tabular-nums text-foreground">{record.glucose}</span>
                            </div>
                            {record.insulinUnits > 0 && (
                              <div className="flex items-center gap-1 justify-end mt-0.5">
                                <Syringe size={12} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{record.insulinUnits}u</span>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDelete(globalIdx)}
                            className="p-1.5 rounded-full hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 size={16} className="text-muted-foreground" />
                          </button>
                        </motion.div>
                      );
                    })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GlucoseTracking;
