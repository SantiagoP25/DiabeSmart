import { useState } from "react";
import { motion } from "framer-motion";
import { Syringe, Check } from "lucide-react";

const InsulinCalculator = () => {
  const [glucose, setGlucose] = useState("");
  const [carbs, setCarbs] = useState("");

  const glucoseNum = parseInt(glucose) || 0;
  const carbsNum = parseInt(carbs) || 0;
  const suggestedDose = carbsNum > 0 ? Math.round((carbsNum / 10 + Math.max(0, (glucoseNum - 120) / 40)) * 10) / 10 : 0;

  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-foreground mb-6"
      >
        Calculadora de Insulina
      </motion.h1>

      {/* Suggested Dose Display */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card rounded-outer p-8 text-center mb-8"
      >
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <Syringe size={28} className="text-primary" />
        </div>
        <p className="text-base font-medium text-muted-foreground mb-2">Dosis sugerida</p>
        <p className="text-metric tabular-nums text-foreground">
          {suggestedDose > 0 ? suggestedDose : "—"}
        </p>
        <p className="text-lg text-muted-foreground font-medium">unidades</p>
      </motion.div>

      {/* Inputs */}
      <div className="space-y-4 mb-8">
        <motion.div
          initial={{ x: -15, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-inner p-5"
        >
          <label className="text-base font-semibold text-foreground block mb-2">
            Glucosa actual (mg/dL)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            placeholder="Ej: 140"
            className="w-full bg-muted/50 border border-border rounded-button py-4 px-4 text-2xl font-bold text-foreground tabular-nums placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </motion.div>

        <motion.div
          initial={{ x: -15, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-inner p-5"
        >
          <label className="text-base font-semibold text-foreground block mb-2">
            Carbohidratos (gramos)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="Ej: 45"
            className="w-full bg-muted/50 border border-border rounded-button py-4 px-4 text-2xl font-bold text-foreground tabular-nums placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </motion.div>
      </div>

      {/* Confirm Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        disabled={suggestedDose <= 0}
        className="w-full bg-primary text-primary-foreground rounded-button py-5 text-xl font-bold soft-press flex items-center justify-center gap-3 disabled:opacity-40"
      >
        <Check size={22} />
        Confirmar Dosis
      </motion.button>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Mantén presionado para confirmar
      </p>
    </div>
  );
};

export default InsulinCalculator;
