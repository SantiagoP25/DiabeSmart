import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Heart, Pill, Phone, Settings, ChevronRight, LogOut, Check, Syringe, Plus, Trash2, Calendar, Weight, Ruler, Activity, Bell, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { buildUserStorageKey } from "@/lib/userStorage";
import logo from "@/assets/logo.png";

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

interface Medication {
  name: string;
  dose: string;
  frequency: string;
}

interface AppSettings {
  notifications: boolean;
  language: string;
  soundAlerts: boolean;
}

const CONTACTS_KEY = "diabesmart_emergency_contacts";
const RECORDS_KEY = "diabesmart_records";
const MEDS_KEY = "diabesmart_medications";
const SETTINGS_KEY = "diabesmart_settings";

const getContacts = (userId: string | null | undefined): EmergencyContact[] => {
  try {
    const raw = localStorage.getItem(buildUserStorageKey(CONTACTS_KEY, userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const getAverage = (userId: string | null | undefined): number | null => {
  try {
    const raw = localStorage.getItem(buildUserStorageKey(RECORDS_KEY, userId));
    const records = raw ? JSON.parse(raw) : [];
    if (records.length === 0) return null;
    const sum = records.reduce((s: number, r: { glucose: number }) => s + r.glucose, 0);
    return Math.round(sum / records.length);
  } catch { return null; }
};

const Profile = () => {
  const { profile: dbProfile, updateProfile, loading: profileLoading } = useProfile();
  const { user, signOut } = useAuth();
  const [editingRatio, setEditingRatio] = useState(false);
  const [editingSensitivity, setEditingSensitivity] = useState(false);
  const [ratio, setRatio] = useState("");
  const [sensitivity, setSensitivity] = useState("");
  const [localProfile, setLocalProfile] = useState({
    weight: "",
    height: "",
    diabetesType: "Tipo 1",
    debutDate: "",
    rangeMin: "70",
    rangeMax: "180",
  });
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [healthOpen, setHealthOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [medsOpen, setMedsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newContact, setNewContact] = useState<EmergencyContact>({ name: "", phone: "", relation: "" });
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMed, setNewMed] = useState<Medication>({ name: "", dose: "", frequency: "" });
  const [settings, setSettings] = useState<AppSettings>({ notifications: true, language: "es", soundAlerts: true });
  const average = getAverage(user?.id);

  const saveMedications = (next: Medication[]) => {
    setMedications(next);
    localStorage.setItem(buildUserStorageKey(MEDS_KEY, user?.id), JSON.stringify(next));
  };

  const handleAddMed = () => {
    if (!newMed.name.trim() || !newMed.dose.trim()) {
      toast({ title: "Error", description: "Nombre y dosis son requeridos" });
      return;
    }
    saveMedications([...medications, newMed]);
    setNewMed({ name: "", dose: "", frequency: "" });
    toast({ title: "✅ Medicamento agregado" });
  };

  const handleDeleteMed = (i: number) => {
    saveMedications(medications.filter((_, idx) => idx !== i));
  };

  const updateSettings = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem(buildUserStorageKey(SETTINGS_KEY, user?.id), JSON.stringify(next));
  };

  useEffect(() => {
    if (dbProfile) {
      setRatio(dbProfile.insulin_ratio?.toString() || "");
      setSensitivity(dbProfile.insulin_sensitivity?.toString() || "");
      setLocalProfile({
        weight: dbProfile.weight?.toString() || "",
        height: dbProfile.height?.toString() || "",
        diabetesType: dbProfile.diabetes_type || "Tipo 1",
        debutDate: dbProfile.debut_date || "",
        rangeMin: dbProfile.glucose_min?.toString() || "70",
        rangeMax: dbProfile.glucose_max?.toString() || "180",
      });
    }
  }, [dbProfile]);

  useEffect(() => {
    if (!user?.id) {
      setContacts([]);
      setMedications([]);
      setSettings({ notifications: true, language: "es", soundAlerts: true });
      return;
    }

    setContacts(getContacts(user.id));
    try {
      setMedications(JSON.parse(localStorage.getItem(buildUserStorageKey(MEDS_KEY, user.id)) || "[]"));
    } catch {
      setMedications([]);
    }
    try {
      const raw = localStorage.getItem(buildUserStorageKey(SETTINGS_KEY, user.id));
      setSettings(raw ? JSON.parse(raw) : { notifications: true, language: "es", soundAlerts: true });
    } catch {
      setSettings({ notifications: true, language: "es", soundAlerts: true });
    }
  }, [user?.id]);

  const handleSaveRatio = async () => {
    const val = parseFloat(ratio);
    if (!val || val <= 0) {
      toast({ title: "Error", description: "Ingresa un ratio válido (ej: 10)" });
      return;
    }
    await updateProfile({ insulin_ratio: val });
    setEditingRatio(false);
    toast({ title: "✅ Ratio guardado", description: `Tu ratio es 1:${val}` });
  };

  const handleSaveSensitivity = async () => {
    const val = parseFloat(sensitivity);
    if (!val || val <= 0) {
      toast({ title: "Error", description: "Ingresa una sensibilidad valida (ej: 50)" });
      return;
    }
    const result = await updateProfile({ insulin_sensitivity: val });
    if (result?.error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la sensibilidad. Verifica la migracion en Supabase.",
        variant: "destructive",
      });
      return;
    }
    setEditingSensitivity(false);
    toast({ title: "✅ Sensibilidad guardada", description: `Tu factor es ${val} mg/dL por 1U` });
  };

  const handleSaveProfile = async () => {
    await updateProfile({
      weight: localProfile.weight ? parseFloat(localProfile.weight) : null,
      height: localProfile.height ? parseFloat(localProfile.height) : null,
      diabetes_type: localProfile.diabetesType,
      debut_date: localProfile.debutDate || null,
      glucose_min: parseFloat(localProfile.rangeMin) || 70,
      glucose_max: parseFloat(localProfile.rangeMax) || 180,
    });
    setHealthOpen(false);
    toast({ title: "✅ Datos guardados" });
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast({ title: "Error", description: "Nombre y teléfono son requeridos" });
      return;
    }
    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem(buildUserStorageKey(CONTACTS_KEY, user?.id), JSON.stringify(updated));
    setNewContact({ name: "", phone: "", relation: "" });
    toast({ title: "✅ Contacto agregado" });
  };

  const handleDeleteContact = (i: number) => {
    const updated = contacts.filter((_, idx) => idx !== i);
    setContacts(updated);
    localStorage.setItem(buildUserStorageKey(CONTACTS_KEY, user?.id), JSON.stringify(updated));
  };

  const savedRatio = dbProfile?.insulin_ratio?.toString() || "";
  const savedSensitivity = dbProfile?.insulin_sensitivity?.toString() || "";

  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground mb-6">
        Mi Perfil
      </motion.h1>

      {/* Profile Card */}
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card rounded-outer p-6 flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <User size={36} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{dbProfile?.display_name || "Usuario"}</h2>
          <p className="text-base text-muted-foreground">{localProfile.weight} kg · {localProfile.diabetesType}</p>
          <p className="text-sm text-primary font-semibold mt-1">Perfil completo ✓</p>
        </div>
      </motion.div>

      {/* Health Summary */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Peso", value: `${localProfile.weight} kg` },
          { label: "Estatura", value: `${localProfile.height} cm` },
          { label: "Promedio", value: average ? `${average}` : "—" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-inner p-4 text-center">
            <p className="text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Insulin Ratio */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card rounded-outer p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Syringe size={20} className="text-primary" />
            <h3 className="text-base font-bold text-foreground">Ratio de Insulina</h3>
          </div>
          {!editingRatio && savedRatio && (
            <button onClick={() => setEditingRatio(true)} className="text-xs text-primary font-semibold">Cambiar</button>
          )}
        </div>
        {editingRatio || !savedRatio ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Tu médico te indica cuántos gramos de carbohidratos cubre 1 unidad de insulina.</p>
            <div className="flex gap-2">
              <Input type="number" placeholder="Ej: 10" value={ratio} onChange={(e) => setRatio(e.target.value)} min={1} max={100} className="text-lg h-12 rounded-inner flex-1" />
              <button onClick={handleSaveRatio} className="h-12 px-4 bg-primary text-primary-foreground rounded-inner font-semibold flex items-center gap-1">
                <Check size={16} /> Guardar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-2xl font-bold text-foreground">1 U por cada <span className="text-primary">{savedRatio}g</span> de HC</p>
            <p className="text-xs text-muted-foreground mt-1">Configurado por tu profesional de salud</p>
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Syringe size={20} className="text-primary" />
              <h3 className="text-base font-bold text-foreground">Sensibilidad a la insulina</h3>
            </div>
            {!editingSensitivity && savedSensitivity && (
              <button onClick={() => setEditingSensitivity(true)} className="text-xs text-primary font-semibold">Cambiar</button>
            )}
          </div>
          {editingSensitivity || !savedSensitivity ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Cuantos mg/dL baja 1 unidad de insulina.</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Ej: 50"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value)}
                  min={1}
                  max={300}
                  className="text-lg h-12 rounded-inner flex-1"
                />
                <button onClick={handleSaveSensitivity} className="h-12 px-4 bg-primary text-primary-foreground rounded-inner font-semibold flex items-center gap-1">
                  <Check size={16} /> Guardar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-foreground">1 U corrige <span className="text-primary">{savedSensitivity} mg/dL</span></p>
              <p className="text-xs text-muted-foreground mt-1">Configurado por tu profesional de salud</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Menu */}
      <div className="space-y-2">
        <motion.button
          initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          onClick={() => setHealthOpen(true)}
          className="w-full glass-card rounded-inner p-4 flex items-center gap-4 soft-press text-left"
        >
          <div className="w-11 h-11 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
            <Heart size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">Datos de salud</p>
            <p className="text-sm text-muted-foreground">{localProfile.diabetesType}, {localProfile.weight}kg, rango {localProfile.rangeMin}-{localProfile.rangeMax}</p>
          </div>
          <ChevronRight size={20} className="text-muted-foreground shrink-0" />
        </motion.button>

        <motion.button
          initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.38 }}
          onClick={() => setContactsOpen(true)}
          className="w-full glass-card rounded-inner p-4 flex items-center gap-4 soft-press text-left"
        >
          <div className="w-11 h-11 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
            <Phone size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">Contactos de emergencia</p>
            <p className="text-sm text-muted-foreground">{contacts.length > 0 ? `${contacts.length} contacto(s)` : "Sin contactos"}</p>
          </div>
          <ChevronRight size={20} className="text-muted-foreground shrink-0" />
        </motion.button>

        <motion.button
          initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.46 }}
          onClick={() => setMedsOpen(true)}
          className="w-full glass-card rounded-inner p-4 flex items-center gap-4 soft-press text-left"
        >
          <div className="w-11 h-11 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
            <Pill size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">Medicamentos</p>
            <p className="text-sm text-muted-foreground">{medications.length > 0 ? `${medications.length} medicamento(s)` : "Sin medicamentos"}</p>
          </div>
          <ChevronRight size={20} className="text-muted-foreground shrink-0" />
        </motion.button>

        <motion.button
          initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.54 }}
          onClick={() => setSettingsOpen(true)}
          className="w-full glass-card rounded-inner p-4 flex items-center gap-4 soft-press text-left"
        >
          <div className="w-11 h-11 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
            <Settings size={22} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-foreground">Configuración</p>
            <p className="text-sm text-muted-foreground">Notificaciones, idioma</p>
          </div>
          <ChevronRight size={20} className="text-muted-foreground shrink-0" />
        </motion.button>
      </div>

      {/* Logo + Logout */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10 flex flex-col items-center gap-4">
        <img src={logo} alt="DiabeSmart" className="w-12 h-12 opacity-60 dark:brightness-150 dark:contrast-125" />
        <p className="text-sm text-muted-foreground">DiabeSmart v1.0</p>
        <button onClick={signOut} className="flex items-center gap-2 text-status-warning font-semibold text-base soft-press py-2 px-4 rounded-button">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </motion.div>

      {/* Health Data Dialog */}
      <Dialog open={healthOpen} onOpenChange={setHealthOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-outer">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Datos de Salud</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><Weight size={16} /> Peso (kg)</label>
              <Input type="number" value={localProfile.weight} onChange={(e) => setLocalProfile({ ...localProfile, weight: e.target.value })} className="h-12 rounded-inner text-lg" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><Ruler size={16} /> Estatura (cm)</label>
              <Input type="number" value={localProfile.height} onChange={(e) => setLocalProfile({ ...localProfile, height: e.target.value })} className="h-12 rounded-inner text-lg" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><Activity size={16} /> Tipo de diabetes</label>
              <div className="grid grid-cols-3 gap-2">
                {["Tipo 1", "Tipo 2", "Gestacional"].map((t) => (
                  <button key={t} onClick={() => setLocalProfile({ ...localProfile, diabetesType: t })}
                    className={`py-3 rounded-inner text-sm font-semibold transition-colors ${localProfile.diabetesType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><Calendar size={16} /> Fecha de debut</label>
              <Input type="date" value={localProfile.debutDate} onChange={(e) => setLocalProfile({ ...localProfile, debutDate: e.target.value })} className="h-12 rounded-inner text-lg" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Rango objetivo de glucosa (mg/dL)</label>
              <div className="flex gap-2 items-center">
                <Input type="number" placeholder="Mín" value={localProfile.rangeMin} onChange={(e) => setLocalProfile({ ...localProfile, rangeMin: e.target.value })} className="h-12 rounded-inner text-lg flex-1" />
                <span className="text-muted-foreground font-bold">—</span>
                <Input type="number" placeholder="Máx" value={localProfile.rangeMax} onChange={(e) => setLocalProfile({ ...localProfile, rangeMax: e.target.value })} className="h-12 rounded-inner text-lg flex-1" />
              </div>
            </div>
            <button onClick={handleSaveProfile} className="w-full py-3 bg-primary text-primary-foreground rounded-inner font-semibold text-lg">
              Guardar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency Contacts Dialog */}
      <Dialog open={contactsOpen} onOpenChange={setContactsOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-outer">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Contactos de Emergencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-inner bg-muted/50">
                <div className="flex-1">
                  <p className="text-base font-semibold text-foreground">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.relation} · {c.phone}</p>
                </div>
                <a href={`tel:${c.phone}`} className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <Phone size={18} className="text-primary" />
                </a>
                <button onClick={() => handleDeleteContact(i)} className="p-2 rounded-full hover:bg-destructive/10">
                  <Trash2 size={16} className="text-muted-foreground" />
                </button>
              </div>
            ))}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Agregar contacto</p>
              <Input placeholder="Nombre" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className="h-11 rounded-inner" />
              <Input placeholder="Teléfono" type="tel" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} className="h-11 rounded-inner" />
              <Input placeholder="Relación (ej: Doctor, Hijo)" value={newContact.relation} onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })} className="h-11 rounded-inner" />
              <button onClick={handleAddContact} className="w-full py-3 bg-primary text-primary-foreground rounded-inner font-semibold flex items-center justify-center gap-2">
                <Plus size={18} /> Agregar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Medications Dialog */}
      <Dialog open={medsOpen} onOpenChange={setMedsOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-outer">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Pill size={20} className="text-primary" /> Medicamentos
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto">
            {medications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Sin medicamentos. Agrega uno abajo.</p>
            )}
            {medications.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-inner bg-muted/50">
                <div className="w-10 h-10 rounded-button bg-primary/15 flex items-center justify-center shrink-0">
                  <Pill size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.dose}{m.frequency ? ` · ${m.frequency}` : ""}</p>
                </div>
                <button onClick={() => handleDeleteMed(i)} className="p-2 rounded-full hover:bg-destructive/10">
                  <Trash2 size={16} className="text-muted-foreground" />
                </button>
              </div>
            ))}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Agregar medicamento</p>
              <Input placeholder="Nombre (ej: Metformina)" value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} className="h-11 rounded-inner" />
              <Input placeholder="Dosis (ej: 500 mg)" value={newMed.dose} onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })} className="h-11 rounded-inner" />
              <Input placeholder="Frecuencia (ej: 2 veces al día)" value={newMed.frequency} onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })} className="h-11 rounded-inner" />
              <button onClick={handleAddMed} className="w-full py-3 bg-primary text-primary-foreground rounded-inner font-semibold flex items-center justify-center gap-2">
                <Plus size={18} /> Agregar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-outer">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Settings size={20} className="text-primary" /> Configuración
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-3 p-3 rounded-inner bg-muted/40">
              <Bell size={20} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-base font-semibold text-foreground">Notificaciones</p>
                <p className="text-xs text-muted-foreground">Recibir recordatorios y alertas</p>
              </div>
              <button
                onClick={() => updateSettings({ notifications: !settings.notifications })}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${settings.notifications ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-background transition-transform ${settings.notifications ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-inner bg-muted/40">
              <Bell size={20} className="text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-base font-semibold text-foreground">Sonido de alertas</p>
                <p className="text-xs text-muted-foreground">Reproducir sonido en alertas críticas</p>
              </div>
              <button
                onClick={() => updateSettings({ soundAlerts: !settings.soundAlerts })}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${settings.soundAlerts ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-background transition-transform ${settings.soundAlerts ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="p-3 rounded-inner bg-muted/40">
              <div className="flex items-center gap-3 mb-3">
                <Globe size={20} className="text-primary shrink-0" />
                <p className="text-base font-semibold text-foreground">Idioma</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[{ k: "es", l: "Español" }, { k: "en", l: "English" }].map((lang) => (
                  <button
                    key={lang.k}
                    onClick={() => updateSettings({ language: lang.k })}
                    className={`py-2.5 rounded-inner text-sm font-semibold transition-colors ${settings.language === lang.k ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
                  >
                    {lang.l}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center pt-2">
              Tus preferencias se guardan automáticamente.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
