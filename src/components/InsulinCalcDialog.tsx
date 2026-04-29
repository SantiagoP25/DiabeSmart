import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Syringe, Calculator, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

interface InsulinCalcDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCarbs?: number;
  breakdown?: { name: string; carbs: number }[];
}

const InsulinCalcDialog = ({ open, onOpenChange, initialCarbs, breakdown }: InsulinCalcDialogProps) => {
  const [carbs, setCarbs] = useState("");
  const [currentGlucose, setCurrentGlucose] = useState("");
  const [showResult, setShowResult] = useState(false);
  const { profile } = useProfile();
  const ratio = profile?.insulin_ratio ?? 0;
  const sensitivity = profile?.insulin_sensitivity ?? 0;

  useEffect(() => {
    if (initialCarbs && initialCarbs > 0) {
      setCarbs(String(initialCarbs));
    }
  }, [initialCarbs]);

  const carbsNum = parseFloat(carbs);
  const currentGlucoseNum = parseFloat(currentGlucose);
  const targetGlucoseNum = profile?.glucose_min ?? 100;
  const foodDose = ratio > 0 && carbsNum > 0 ? carbsNum / ratio : 0;
  const correctionDose = sensitivity > 0 && currentGlucoseNum > 0 && targetGlucoseNum > 0
    ? (currentGlucoseNum - targetGlucoseNum) / sensitivity
    : 0;
  const totalDose = foodDose + correctionDose;

  const handleCalculate = () => {
    if (!ratio || ratio <= 0) {
      toast({
        title: "⚠️ Ratio no configurado",
        description: "Ve a Mi Perfil → Configuración para establecer tu ratio de insulina.",
      });
      return;
    }
    if (!sensitivity || sensitivity <= 0) {
      toast({
        title: "⚠️ Sensibilidad no configurada",
        description: "Ve a Mi Perfil → Configuración para establecer tu sensibilidad a la insulina.",
      });
      return;
    }
    if (!currentGlucoseNum || currentGlucoseNum <= 0) {
      toast({ title: "Error", description: "Ingresa la glucosa actual" });
      return;
    }
    if (!carbsNum || carbsNum <= 0) {
      toast({ title: "Error", description: "Ingresa los gramos de carbohidratos" });
      return;
    }
    setShowResult(true);
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setShowResult(false);
      setCarbs("");
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto rounded-outer">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calculator size={22} className="text-primary" />
            Calculadora de Insulina
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Calcula tu dosis según tus carbohidratos y ratio personal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Ratio display */}
          <div className="glass-card rounded-inner p-4 space-y-2">
            {ratio > 0 ? (
              <p className="text-sm font-bold text-foreground">
                Tu ratio: 1 U por cada <span className="text-primary">{ratio}g</span> de HC
              </p>
            ) : (
              <div className="flex items-center gap-3 text-status-warning">
                <AlertTriangle size={20} />
                <p className="text-sm font-semibold">
                  Ratio no configurado. Ve a <span className="underline">Mi Perfil → Configuración</span> para establecerlo.
                </p>
              </div>
            )}
            {sensitivity > 0 ? (
              <p className="text-sm font-bold text-foreground">
                Sensibilidad: 1 U corrige <span className="text-primary">{sensitivity} mg/dL</span>
              </p>
            ) : (
              <div className="flex items-center gap-3 text-status-warning">
                <AlertTriangle size={20} />
                <p className="text-sm font-semibold">
                  Sensibilidad no configurada. Ve a <span className="underline">Mi Perfil → Configuración</span> para establecerla.
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Objetivo usado: <span className="font-semibold text-foreground">{targetGlucoseNum} mg/dL</span>
            </p>
          </div>

          {/* Breakdown of foods */}
          {breakdown && breakdown.length > 0 && (
            <div className="glass-card rounded-inner p-4 space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Alimentos seleccionados</p>
              {breakdown.map((b, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-foreground truncate pr-2">{b.name}</span>
                  <span className="font-semibold text-primary tabular-nums shrink-0">{b.carbs}g</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 mt-2 border-t border-border text-sm font-bold">
                <span className="text-foreground">Total HC</span>
                <span className="text-primary tabular-nums">{breakdown.reduce((s, b) => s + b.carbs, 0)}g</span>
              </div>
            </div>
          )}

          {/* Carbs Input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Syringe size={18} className="text-primary" />
              Carbohidratos a consumir (g)
            </Label>
            <Input
              type="number"
              placeholder="Ej: 45"
              value={carbs}
              onChange={(e) => {
                setCarbs(e.target.value);
                setShowResult(false);
              }}
              min={0}
              max={500}
              className="text-lg h-12 rounded-inner"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Syringe size={18} className="text-primary" />
              Glucosa actual (mg/dL)
            </Label>
            <Input
              type="number"
              placeholder="Ej: 365"
              value={currentGlucose}
              onChange={(e) => {
                setCurrentGlucose(e.target.value);
                setShowResult(false);
              }}
              min={0}
              max={600}
              className="text-lg h-12 rounded-inner"
            />
          </div>


          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-primary text-primary-foreground rounded-button py-4 text-base font-bold soft-press flex items-center justify-center gap-2"
          >
            <Calculator size={20} />
            Calcular Dosis
          </button>

          {/* Result */}
          {showResult && totalDose !== 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-inner p-5 text-center space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Tu dosis recomendada</p>
              <p className="text-4xl font-black text-primary">
                {totalDose % 1 === 0 ? totalDose : totalDose.toFixed(1)} U
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  Dosis por alimentos: <span className="font-bold text-foreground">{foodDose.toFixed(2)} U</span>
                </p>
                <p>
                  Dosis de correccion: <span className="font-bold text-foreground">{correctionDose.toFixed(2)} U</span>
                </p>
                <p>
                  Dosis total: <span className="font-bold text-foreground">{totalDose.toFixed(2)} U</span>
                </p>
                <p className="pt-2">
                  {carbsNum}g HC ÷ {ratio} + ({currentGlucoseNum} - {targetGlucoseNum}) ÷ {sensitivity}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-primary/20">
                <p className="text-xs text-muted-foreground">
                  ⚠️ Esta es una estimación. Consulta siempre con tu médico antes de ajustar tu dosis.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InsulinCalcDialog;
