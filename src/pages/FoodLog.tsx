import { motion } from "framer-motion";
import { Camera, Search, Sparkles, Apple, Wheat, Coffee } from "lucide-react";

const suggestions = [
  { icon: Apple, name: "1 Manzana", carbs: "25g", cal: "95 kcal" },
  { icon: Wheat, name: "1 Taza Avena", carbs: "27g", cal: "154 kcal" },
  { icon: Coffee, name: "Café con leche", carbs: "6g", cal: "67 kcal" },
];

const FoodLog = () => {
  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-foreground mb-6"
      >
        Registro de Comida
      </motion.h1>

      {/* Camera Area */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-outer overflow-hidden mb-6"
      >
        <div className="aspect-[4/3] bg-muted/50 flex flex-col items-center justify-center gap-4 relative">
          <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-inner" />
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
            <Camera size={32} className="text-primary" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">Toca para escanear tu plato</p>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Sparkles size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">Análisis con IA</span>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mb-6"
      >
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar alimento..."
          className="w-full bg-muted/50 border border-border rounded-button py-4 pl-12 pr-4 text-lg font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </motion.div>

      {/* AI Suggestions */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-bold text-foreground mb-3">Sugerencias IA</h2>
        <div className="space-y-3">
          {suggestions.map((item, i) => (
            <motion.button
              key={item.name}
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="w-full glass-card rounded-inner p-4 flex items-center gap-4 soft-press text-left"
            >
              <div className="w-12 h-12 rounded-button bg-secondary/40 flex items-center justify-center shrink-0">
                <item.icon size={24} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.carbs} carbohidratos · {item.cal}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Calculate Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="w-full mt-6 bg-primary text-primary-foreground rounded-button py-5 text-xl font-bold soft-press flex items-center justify-center gap-3"
      >
        <Sparkles size={22} />
        Calcular Insulina
      </motion.button>
    </div>
  );
};

export default FoodLog;
