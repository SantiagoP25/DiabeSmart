import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface GlucoseCircleProps {
  value: number;
  unit?: string;
  status?: "good" | "warning" | "danger";
}

const getAutoStatus = (value: number): "good" | "warning" | "danger" => {
  if (value > 180 || value < 60) return "danger";
  if (value > 140 || value < 70) return "warning";
  return "good";
};

const statusLabels = {
  good: "Nivel Normal",
  warning: "Nivel Alto",
  danger: "¡Atención!",
};

const statusColors = {
  good: "bg-status-good/15 text-status-good",
  warning: "bg-status-warning/15 text-status-warning",
  danger: "bg-status-danger/15 text-status-danger",
};

const GlucoseCircle = ({ value, unit = "mg/dL", status }: GlucoseCircleProps) => {
  const resolvedStatus = status ?? getAutoStatus(value);

  const showHighAlert = value > 180;
  const showLowAlert = value < 60;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="glucose-circle w-52 h-52 rounded-full flex flex-col items-center justify-center">
        <span className="text-metric-lg tabular-nums text-foreground">{value}</span>
        <span className="text-lg font-medium text-muted-foreground">{unit}</span>
      </div>
      <span
        className={`px-5 py-2 rounded-full text-base font-semibold ${statusColors[resolvedStatus]}`}
      >
        {statusLabels[resolvedStatus]}
      </span>

      {showHighAlert && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs rounded-inner border border-status-danger/30 bg-status-danger/10 p-4 flex items-start gap-3"
        >
          <AlertTriangle size={22} className="text-status-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">⚠️ Glucosa alta</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tu nivel ({value} mg/dL) está por encima de los 180 mg/dL recomendados. Considera consultar a tu médico.
            </p>
          </div>
        </motion.div>
      )}

      {showLowAlert && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xs rounded-inner border border-status-warning/30 bg-status-warning/10 p-4 flex items-start gap-3"
        >
          <AlertTriangle size={22} className="text-status-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground">⚠️ Glucosa baja</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tu nivel ({value} mg/dL) está por debajo de los 60 mg/dL recomendados. Ingiere algo con azúcar de inmediato.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GlucoseCircle;
