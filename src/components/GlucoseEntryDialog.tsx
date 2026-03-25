import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Utensils, Syringe } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GlucoseEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: {
    glucose: number;
    meal: string;
    insulinUnits: number;
    timestamp: Date;
  }) => void;
}

const mealOptions = ["Desayuno", "Almuerzo", "Comida", "Otro"] as const;

const GlucoseEntryDialog = ({ open, onOpenChange, onSave }: GlucoseEntryDialogProps) => {
  const [glucose, setGlucose] = useState("");
  const [meal, setMeal] = useState<string>("");
  const [insulinUnits, setInsulinUnits] = useState("");

  const handleSubmit = () => {
    const glucoseNum = Number(glucose);
    const unitsNum = Number(insulinUnits);

    if (!glucoseNum || glucoseNum < 20 || glucoseNum > 600) {
      toast({ title: "Error", description: "Ingresa un valor de glucosa válido (20-600 mg/dL)" });
      return;
    }
    if (unitsNum < 0 || unitsNum > 100) {
      toast({ title: "Error", description: "Las unidades de insulina deben ser entre 0 y 100" });
      return;
    }

    onSave({
      glucose: glucoseNum,
      meal: meal || "Sin especificar",
      insulinUnits: unitsNum || 0,
      timestamp: new Date(),
    });

    toast({ title: "✅ Registro guardado", description: `Glucosa: ${glucoseNum} mg/dL` });
    setGlucose("");
    setMeal("");
    setInsulinUnits("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-outer">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Registrar glucosa
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Ingresa tu lectura actual, momento del día y dosis de insulina.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Glucose */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Droplets size={18} className="text-primary" />
              Glucosa (mg/dL)
            </Label>
            <Input
              type="number"
              placeholder="Ej: 120"
              value={glucose}
              onChange={(e) => setGlucose(e.target.value)}
              min={20}
              max={600}
              className="text-lg h-12 rounded-inner"
            />
          </div>

          {/* Meal - 4 options */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Utensils size={18} className="text-primary" />
              Momento
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {mealOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setMeal(opt)}
                  className={`py-3 px-4 rounded-inner text-sm font-semibold transition-colors border ${
                    meal === opt
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-foreground border-border"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Insulin Units */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Syringe size={18} className="text-primary" />
              Unidades de insulina
            </Label>
            <Input
              type="number"
              placeholder="Ej: 4"
              value={insulinUnits}
              onChange={(e) => setInsulinUnits(e.target.value)}
              min={0}
              max={100}
              className="text-lg h-12 rounded-inner"
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={handleSubmit}
            className="w-full bg-primary text-primary-foreground rounded-button py-4 text-base font-semibold soft-press"
          >
            Guardar registro
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GlucoseEntryDialog;
