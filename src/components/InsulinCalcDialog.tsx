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
import { Syringe, Calculator, Settings2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InsulinCalcDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCarbs?: number;
}

const InsulinCalcDialog = ({ open, onOpenChange, initialCarbs }: InsulinCalcDialogProps) => {
  const [ratio, setRatio] = useState("");
  const [carbs, setCarbs] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [editingRatio, setEditingRatio] = useState(false);

  // Load saved ratio
  useEffect(() => {
    const saved = localStorage.getItem("diabesmart_ratio");
    if (saved) {
      setRatio(saved);
    } else {
      setEditingRatio(true);
    }
  }, [open]);

  useEffect(() => {
    if (initialCarbs && initialCarbs > 0) {
      setCarbs(String(initialCarbs));
    }
  }, [initialCarbs]);

  const ratioNum = parseFloat(ratio);
  const carbsNum = parseFloat(carbs);
  const dose = ratioNum > 0 && carbsNum > 0 ? carbsNum / ratioNum : 0;

  const handleSaveRatio = () => {
    if (!ratioNum || ratioNum <= 0) {
      toast({ title: "Error", description: "Ingresa un ratio válido (ej: 10)" });
      return;
    }
    localStorage.setItem("diabesmart_ratio", ratio);
    setEditingRatio(false);
    toast({ title: "✅ Ratio guardado", description: `Tu ratio es 1:${ratioNum}` });
  };

  const handleCalculate = () => {
    if (!ratioNum || ratioNum <= 0) {
      toast({ title: "⚠️ Configura tu ratio", description: "Primero necesitas establecer tu ratio de insulina" });
      setEditingRatio(true);
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
          {/* Ratio Section */}
          <div className="glass-card rounded-inner p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Settings2 size={18} className="text-primary" />
                Tu Ratio (1 U : ___ g HC)
              </Label>
              {!editingRatio && ratioNum > 0 && (
                <button
                  onClick={() => setEditingRatio(true)}
                  className="text-xs text-primary font-semibold"
                >
                  Cambiar
                </button>
              )}
            </div>

            {editingRatio ? (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Ej: 10"
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  min={1}
                  max={100}
                  className="text-lg h-12 rounded-inner flex-1"
                />
                <button
                  onClick={handleSaveRatio}
                  className="h-12 px-4 bg-primary text-primary-foreground rounded-inner font-semibold flex items-center gap-1"
                >
                  <Check size={16} />
                  Guardar
                </button>
              </div>
            ) : (
              <p className="text-2xl font-bold text-foreground">
                1 U por cada <span className="text-primary">{ratioNum}g</span> de HC
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Tu médico te indica cuántos gramos de carbohidratos cubre 1 unidad de insulina.
            </p>
          </div>

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

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-primary text-primary-foreground rounded-button py-4 text-base font-bold soft-press flex items-center justify-center gap-2"
          >
            <Calculator size={20} />
            Calcular Dosis
          </button>

          {/* Result */}
          {showResult && dose > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-inner p-5 text-center space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Tu dosis recomendada</p>
              <p className="text-4xl font-black text-primary">
                {dose % 1 === 0 ? dose : dose.toFixed(1)} U
              </p>
              <p className="text-sm text-muted-foreground">
                {carbsNum}g HC ÷ {ratioNum} ratio = <span className="font-bold text-foreground">{dose.toFixed(2)} unidades</span>
              </p>
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
