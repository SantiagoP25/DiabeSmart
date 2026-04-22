import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Clock, Syringe, Droplets, Phone, CheckCircle2, PieChart, Pencil, Plus, Trash2 } from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const RECORDS_KEY = "diabesmart_records";
const PROFILE_KEY = "diabesmart_health_profile";
const CONTACTS_KEY = "diabesmart_emergency_contacts";
const REMINDERS_KEY = "diabesmart_reminders";

interface GlucoseRecord {
  glucose: number;
  meal: string;
  insulinUnits: number;
  timestamp: string;
}

interface HealthProfile {
  rangeMin: string;
  rangeMax: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

type ReminderIcon = "droplets" | "syringe" | "clock";
interface Reminder {
  id: string;
  icon: ReminderIcon;
  title: string;
  time: string; // HH:MM (24h)
  active: boolean;
}

const iconMap = { droplets: Droplets, syringe: Syringe, clock: Clock };

const defaultReminders: Reminder[] = [
  { id: "r1", icon: "droplets", title: "Medir glucosa", time: "18:00", active: true },
  { id: "r2", icon: "syringe", title: "Dosis de insulina", time: "20:00", active: true },
  { id: "r3", icon: "clock", title: "Tomar medicamento", time: "21:00", active: false },
];

const getRecords = (): GlucoseRecord[] => {
  try { return JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]"); } catch { return []; }
};

const getProfile = (): HealthProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : { rangeMin: "70", rangeMax: "180" };
  } catch { return { rangeMin: "70", rangeMax: "180" }; }
};

const getContacts = (): EmergencyContact[] => {
  try { return JSON.parse(localStorage.getItem(CONTACTS_KEY) || "[]"); } catch { return []; }
};

const getReminders = (): Reminder[] => {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : defaultReminders;
  } catch { return defaultReminders; }
};

const formatTime12 = (time24: string) => {
  const [h, m] = time24.split(":").map(Number);
  if (isNaN(h)) return time24;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
};

const Alerts = () => {
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [profile, setProfile] = useState<HealthProfile>(getProfile());
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>(defaultReminders);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);

  useEffect(() => {
    setRecords(getRecords());
    setProfile(getProfile());
    setContacts(getContacts());
    setReminders(getReminders());
  }, []);

  const persistReminders = (next: Reminder[]) => {
    setReminders(next);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
  };

  const openEdit = (r?: Reminder) => {
    setEditing(r ?? { id: `r${Date.now()}`, icon: "clock", title: "", time: "08:00", active: true });
    setEditOpen(true);
  };

  const saveReminder = () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast({ title: "Error", description: "Ingresa un nombre para el recordatorio" });
      return;
    }
    const exists = reminders.find(r => r.id === editing.id);
    const next = exists
      ? reminders.map(r => r.id === editing.id ? editing : r)
      : [...reminders, editing];
    persistReminders(next);
    setEditOpen(false);
    toast({ title: "✅ Recordatorio guardado", description: `${editing.title} a las ${formatTime12(editing.time)}` });
  };

  const deleteReminder = (id: string) => {
    persistReminders(reminders.filter(r => r.id !== id));
  };

  const toggleReminder = (id: string) => {
    persistReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const rangeMin = parseInt(profile.rangeMin) || 70;
  const rangeMax = parseInt(profile.rangeMax) || 180;

  const inRange = records.filter(r => r.glucose >= rangeMin && r.glucose <= rangeMax).length;
  const belowRange = records.filter(r => r.glucose < rangeMin).length;
  const aboveRange = records.filter(r => r.glucose > rangeMax).length;
  const total = records.length;

  const pctIn = total ? Math.round((inRange / total) * 100) : 0;
  const pctBelow = total ? Math.round((belowRange / total) * 100) : 0;
  const pctAbove = total ? 100 - pctIn - pctBelow : 0;

  const chartData = [
    { name: "En rango", value: pctIn || 0 },
    { name: "Sobre rango", value: pctAbove || 0 },
    { name: "Bajo rango", value: pctBelow || 0 },
  ].filter(d => d.value > 0);

  const COLORS = ["hsl(145, 45%, 45%)", "hsl(30, 80%, 55%)", "hsl(0, 65%, 55%)"];

  const recentRecords = records.slice(-5);
  const dynamicAlerts: { type: "warning" | "good" | "danger"; title: string; desc: string }[] = [];

  if (pctIn >= 70) {
    dynamicAlerts.push({ type: "good", title: "¡Buen control!", desc: `El ${pctIn}% de tus lecturas están en rango. ¡Sigue así!` });
  }
  if (pctAbove > 30) {
    dynamicAlerts.push({ type: "warning", title: "Lecturas altas frecuentes", desc: `El ${pctAbove}% de tus lecturas están sobre ${rangeMax} mg/dL.` });
  }
  if (pctBelow > 10) {
    dynamicAlerts.push({ type: "danger", title: "Cuidado con hipoglucemias", desc: `El ${pctBelow}% de tus lecturas están bajo ${rangeMin} mg/dL.` });
  }
  if (recentRecords.length > 0) {
    const last = recentRecords[recentRecords.length - 1];
    if (last.glucose > rangeMax) {
      dynamicAlerts.push({ type: "warning", title: "Última lectura elevada", desc: `Tu última lectura fue ${last.glucose} mg/dL. Recuerda beber agua.` });
    }
  }
  if (dynamicAlerts.length === 0 && total > 0) {
    dynamicAlerts.push({ type: "good", title: "¡Buen trabajo!", desc: "Tu control glucémico se ve bien. Sigue monitoreando." });
  }

  const alertStyles = {
    warning: "border-status-warning/25 bg-status-warning/8",
    good: "border-status-good/25 bg-status-good/8",
    danger: "border-status-danger/25 bg-status-danger/8",
  };

  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-6">
        <Bell size={26} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Alertas y Recordatorios</h1>
      </motion.div>

      {/* Time in Range Chart */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-outer p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Tiempo en Rango</h2>
        </div>

        {total === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Registra lecturas de glucosa para ver tu gráfico</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-36 h-36 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[chartData[i]?.name === "En rango" ? 0 : chartData[i]?.name === "Sobre rango" ? 1 : 2]} />
                    ))}
                  </Pie>
                </RechartsPie>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-foreground tabular-nums">{pctIn}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-good" />
                <span className="text-sm text-foreground font-medium">En rango</span>
                <span className="ml-auto text-sm font-bold text-foreground tabular-nums">{pctIn}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-warning" />
                <span className="text-sm text-foreground font-medium">Sobre rango</span>
                <span className="ml-auto text-sm font-bold text-foreground tabular-nums">{pctAbove}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-danger" />
                <span className="text-sm text-foreground font-medium">Bajo rango</span>
                <span className="ml-auto text-sm font-bold text-foreground tabular-nums">{pctBelow}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Rango: {rangeMin}–{rangeMax} mg/dL</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Reminders */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Recordatorios</h2>
          <button
            onClick={() => openEdit()}
            className="flex items-center gap-1 text-sm font-semibold text-primary px-3 py-1.5 rounded-button bg-primary/10 soft-press"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
        <div className="space-y-3">
          {reminders.map((r, i) => {
            const Icon = iconMap[r.icon];
            return (
              <motion.div key={r.id} initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }} className="glass-card rounded-inner p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={24} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">{r.title}</p>
                  <p className="text-sm text-muted-foreground">{formatTime12(r.time)}</p>
                </div>
                <button
                  onClick={() => toggleReminder(r.id)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${r.active ? "bg-primary" : "bg-muted"}`}
                  title={r.active ? "Activo" : "Inactivo"}
                >
                  <div className={`w-5 h-5 rounded-full bg-background transition-transform ${r.active ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <button onClick={() => openEdit(r)} className="p-1.5 rounded-full hover:bg-muted">
                  <Pencil size={16} className="text-muted-foreground" />
                </button>
                <button onClick={() => deleteReminder(r.id)} className="p-1.5 rounded-full hover:bg-destructive/10">
                  <Trash2 size={16} className="text-muted-foreground" />
                </button>
              </motion.div>
            );
          })}
          {reminders.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No hay recordatorios. Agrega uno para empezar.</p>
          )}
        </div>
      </motion.div>

      {/* Alerts */}
      {dynamicAlerts.length > 0 && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-3">Notificaciones</h2>
          <div className="space-y-3">
            {dynamicAlerts.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 + i * 0.1 }} className={`rounded-inner p-5 border ${alertStyles[a.type]}`}>
                <p className="text-base font-bold text-foreground">{a.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Emergency Contacts */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="space-y-3">
        {contacts.length > 0 ? (
          contacts.map((c, i) => (
            <a key={i} href={`tel:${c.phone}`} className="w-full glass-card rounded-outer p-5 soft-press flex items-center gap-3 border-2 border-primary/20 block">
              <Phone size={24} className="text-primary shrink-0" />
              <div className="flex-1 text-left">
                <span className="text-lg font-bold text-foreground block">{c.name}</span>
                <span className="text-sm text-muted-foreground">{c.relation} · {c.phone}</span>
              </div>
            </a>
          ))
        ) : (
          <button className="w-full glass-card rounded-outer p-5 soft-press flex items-center justify-center gap-3 border-2 border-status-warning/30">
            <Phone size={24} className="text-status-warning" />
            <span className="text-xl font-bold text-foreground">Llamar al Doctor</span>
          </button>
        )}
      </motion.div>

      {/* Edit Reminder Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-outer">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {editing && reminders.find(r => r.id === editing.id) ? "Editar recordatorio" : "Nuevo recordatorio"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Nombre</label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Ej: Medir glucosa"
                  className="h-12 rounded-inner text-base"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Hora</label>
                <Input
                  type="time"
                  value={editing.time}
                  onChange={(e) => setEditing({ ...editing, time: e.target.value })}
                  className="h-12 rounded-inner text-base"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Ícono</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["droplets", "syringe", "clock"] as ReminderIcon[]).map((ic) => {
                    const Icon = iconMap[ic];
                    return (
                      <button
                        key={ic}
                        onClick={() => setEditing({ ...editing, icon: ic })}
                        className={`py-3 rounded-inner flex items-center justify-center transition-colors ${editing.icon === ic ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        <Icon size={22} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={saveReminder}
                className="w-full py-3 bg-primary text-primary-foreground rounded-inner font-semibold text-lg"
              >
                Guardar
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Alerts;
