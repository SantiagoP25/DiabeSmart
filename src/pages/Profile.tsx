import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Heart, Pill, Phone, Settings, ChevronRight, LogOut, Check, Syringe, Plus, Trash2, Calendar, Weight, Ruler, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import logo from "@/assets/logo.png";

interface HealthProfile {
  weight: string;
  height: string;
  diabetesType: string;
  debutDate: string;
  rangeMin: string;
  rangeMax: string;
}

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

const PROFILE_KEY = "diabesmart_health_profile";
const CONTACTS_KEY = "diabesmart_emergency_contacts";
const RECORDS_KEY = "diabesmart_records";

const getProfile = (): HealthProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : { weight: "68", height: "170", diabetesType: "Tipo 2", debutDate: "", rangeMin: "70", rangeMax: "180" };
  } catch { return { weight: "68", height: "170", diabetesType: "Tipo 2", debutDate: "", rangeMin: "70", rangeMax: "180" }; }
};

const getContacts = (): EmergencyContact[] => {
  try {
    const raw = localStorage.getItem(CONTACTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const getAverage = (): number | null => {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    const records = raw ? JSON.parse(raw) : [];
    if (records.length === 0) return null;
    const sum = records.reduce((s: number, r: { glucose: number }) => s + r.glucose, 0);
    return Math.round(sum / records.length);
  } catch { return null; }
};

const Profile = () => {
  const [editingRatio, setEditingRatio] = useState(false);
  const [ratio, setRatio] = useState("");
  const [profile, setProfile] = useState<HealthProfile>(getProfile());
  const [contacts, setContacts] = useState<EmergencyContact[]>(getContacts());
  const [healthOpen, setHealthOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [newContact, setNewContact] = useState<EmergencyContact>({ name: "", phone: "", relation: "" });
  const average = getAverage();

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

  const handleSaveProfile = () => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
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
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
    setNewContact({ name: "", phone: "", relation: "" });
    toast({ title: "✅ Contacto agregado" });
  };

  const handleDeleteContact = (i: number) => {
    const updated = contacts.filter((_, idx) => idx !== i);
    setContacts(updated);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
  };

  const savedRatio = localStorage.getItem("diabesmart_ratio");

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
          <h2 className="text-xl font-bold text-foreground">Oscar Aldana</h2>
          <p className="text-base text-muted-foreground">{profile.weight} kg · {profile.diabetesType}</p>
          <p className="text-sm text-primary font-semibold mt-1">Perfil completo ✓</p>
        </div>
      </motion.div>

      {/* Health Summary */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Peso", value: `${profile.weight} kg` },
          { label: "Estatura", value: `${profile.height} cm` },
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
            <p className="text-sm text-muted-foreground">{profile.diabetesType}, {profile.weight}kg, rango {profile.rangeMin}-{profile.rangeMax}</p>
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

        {[
          { icon: Pill, label: "Medicamentos", desc: "Insulina, metformina" },
          { icon: Settings, label: "Configuración", desc: "Notificaciones, idioma" },
        ].map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ x: -15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.46 + i * 0.08 }}
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10 flex flex-col items-center gap-4">
        <img src={logo} alt="DiabeSmart" className="w-12 h-12 opacity-60 dark:brightness-150 dark:contrast-125" />
        <p className="text-sm text-muted-foreground">DiabeSmart v1.0</p>
        <button className="flex items-center gap-2 text-status-warning font-semibold text-base soft-press py-2 px-4 rounded-button">
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
              <Input type="number" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} className="h-12 rounded-inner text-lg" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><Ruler size={16} /> Estatura (cm)</label>
              <Input type="number" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} className="h-12 rounded-inner text-lg" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><Activity size={16} /> Tipo de diabetes</label>
              <div className="grid grid-cols-3 gap-2">
                {["Tipo 1", "Tipo 2", "Gestacional"].map((t) => (
                  <button key={t} onClick={() => setProfile({ ...profile, diabetesType: t })}
                    className={`py-3 rounded-inner text-sm font-semibold transition-colors ${profile.diabetesType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-1"><Calendar size={16} /> Fecha de debut</label>
              <Input type="date" value={profile.debutDate} onChange={(e) => setProfile({ ...profile, debutDate: e.target.value })} className="h-12 rounded-inner text-lg" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Rango objetivo de glucosa (mg/dL)</label>
              <div className="flex gap-2 items-center">
                <Input type="number" placeholder="Mín" value={profile.rangeMin} onChange={(e) => setProfile({ ...profile, rangeMin: e.target.value })} className="h-12 rounded-inner text-lg flex-1" />
                <span className="text-muted-foreground font-bold">—</span>
                <Input type="number" placeholder="Máx" value={profile.rangeMax} onChange={(e) => setProfile({ ...profile, rangeMax: e.target.value })} className="h-12 rounded-inner text-lg flex-1" />
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
    </div>
  );
};

export default Profile;
