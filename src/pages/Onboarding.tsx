import { useState } from "react";
import { motion } from "framer-motion";
import { User, Weight, Ruler, Activity, Calendar, Syringe, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import logo from "@/assets/logo.png";

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    display_name: "",
    weight: "",
    height: "",
    diabetes_type: "Tipo 1",
    debut_date: "",
    insulin_ratio: "",
    glucose_min: "70",
    glucose_max: "180",
  });
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    if (!form.display_name.trim()) {
      toast({ title: "Error", description: "Ingresa tu nombre", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({
      display_name: form.display_name.trim(),
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      diabetes_type: form.diabetes_type,
      debut_date: form.debut_date || null,
      insulin_ratio: form.insulin_ratio ? parseFloat(form.insulin_ratio) : null,
      glucose_min: parseFloat(form.glucose_min) || 70,
      glucose_max: parseFloat(form.glucose_max) || 180,
    }) ?? { error: null };
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    } else {
      toast({ title: "¡Bienvenido!", description: "Tu perfil ha sido configurado" });
      onComplete();
    }
  };

  const steps = [
    // Step 0: Nombre y datos básicos
    <div key="basic" className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <User size={16} className="text-primary" /> Tu nombre
        </label>
        <Input
          placeholder="¿Cómo te llamas?"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          className="h-12 text-base rounded-inner"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <Weight size={16} className="text-primary" /> Peso (kg)
          </label>
          <Input
            type="number"
            placeholder="68"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="h-12 text-base rounded-inner"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
            <Ruler size={16} className="text-primary" /> Estatura (cm)
          </label>
          <Input
            type="number"
            placeholder="170"
            value={form.height}
            onChange={(e) => setForm({ ...form, height: e.target.value })}
            className="h-12 text-base rounded-inner"
          />
        </div>
      </div>
    </div>,

    // Step 1: Diabetes info
    <div key="diabetes" className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <Activity size={16} className="text-primary" /> Tipo de diabetes
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["Tipo 1", "Tipo 2", "Gestacional"].map((t) => (
            <button
              key={t}
              onClick={() => setForm({ ...form, diabetes_type: t })}
              className={`py-3 rounded-inner text-sm font-semibold transition-colors ${
                form.diabetes_type === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <Calendar size={16} className="text-primary" /> Fecha de debut
        </label>
        <Input
          type="date"
          value={form.debut_date}
          onChange={(e) => setForm({ ...form, debut_date: e.target.value })}
          className="h-12 text-base rounded-inner"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <Syringe size={16} className="text-primary" /> Ratio de insulina (g de HC por 1U)
        </label>
        <Input
          type="number"
          placeholder="Ej: 10"
          value={form.insulin_ratio}
          onChange={(e) => setForm({ ...form, insulin_ratio: e.target.value })}
          className="h-12 text-base rounded-inner"
        />
        <p className="text-xs text-muted-foreground mt-1">Tu médico te indica este valor. Puedes cambiarlo después en Ajustes.</p>
      </div>
    </div>,

    // Step 2: Rango objetivo
    <div key="range" className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
          <Target size={16} className="text-primary" /> Rango objetivo de glucosa (mg/dL)
        </label>
        <div className="flex gap-3 items-center">
          <Input
            type="number"
            placeholder="70"
            value={form.glucose_min}
            onChange={(e) => setForm({ ...form, glucose_min: e.target.value })}
            className="h-12 text-base rounded-inner flex-1"
          />
          <span className="text-muted-foreground font-bold text-lg">—</span>
          <Input
            type="number"
            placeholder="180"
            value={form.glucose_max}
            onChange={(e) => setForm({ ...form, glucose_max: e.target.value })}
            className="h-12 text-base rounded-inner flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Este rango se usará para tus alertas y gráficos.</p>
      </div>
    </div>,
  ];

  const titles = ["Cuéntanos sobre ti", "Tu diabetes", "Tu rango objetivo"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-background">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center mb-6"
      >
        <img src={logo} alt="DiabeSmart" className="w-16 h-16 rounded-full mb-3 dark:brightness-150 dark:contrast-125" />
        <h1 className="text-2xl font-bold text-foreground">Configura tu perfil</h1>
      </motion.div>

      {/* Progress */}
      <div className="flex gap-2 mb-6 w-full max-w-sm">
        {titles.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full max-w-sm"
      >
        <h2 className="text-lg font-bold text-foreground mb-4">{titles[step]}</h2>
        {steps[step]}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-inner bg-muted text-muted-foreground font-semibold text-base"
            >
              Atrás
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 rounded-inner bg-primary text-primary-foreground font-semibold text-base"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 py-3 rounded-inner bg-primary text-primary-foreground font-semibold text-base disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Comenzar"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
