import { motion } from "framer-motion";

interface GlucoseCircleProps {
  value: number;
  unit?: string;
  status: "good" | "warning" | "danger";
}

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
        className={`px-5 py-2 rounded-full text-base font-semibold ${statusColors[status]}`}
      >
        {statusLabels[status]}
      </span>
    </motion.div>
  );
};

export default GlucoseCircle;
