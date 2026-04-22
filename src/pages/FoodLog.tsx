import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ChevronDown, Milk, Wheat, Apple, Carrot, Nut, GlassWater, UtensilsCrossed, Plus, Calculator, X, ShoppingBasket, Trash2 } from "lucide-react";
import { carbsDatabase, foodCategories, type FoodItem, type FoodCategory } from "@/data/carbsDatabase";
import InsulinCalcDialog from "@/components/InsulinCalcDialog";

const categoryIcons: Record<FoodCategory, React.ElementType> = {
  "Lácteos": Milk,
  "Cereales y derivados": Wheat,
  "Frutas": Apple,
  "Hortalizas": Carrot,
  "Frutos secos": Nut,
  "Bebidas": GlassWater,
  "Otros": UtensilsCrossed,
};

const giColor = (gi: string) => {
  const val = parseInt(gi);
  if (isNaN(val)) return "text-muted-foreground";
  if (val <= 55) return "text-green-600 dark:text-green-400";
  if (val <= 69) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
};

const giLabel = (gi: string) => {
  const val = parseInt(gi);
  if (isNaN(val)) return "-";
  if (val <= 55) return "Bajo";
  if (val <= 69) return "Moderado";
  return "Alto";
};

/** Compute carb grams from rations (1 ration = 10g HC) */
const getCarbGrams = (item: FoodItem): string => {
  const r = parseFloat(item.rations);
  if (isNaN(r) || item.rations === "No valorable" || item.rations === "-") return "-";
  return (r * 10).toFixed(0);
};

const FoodLog = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FoodCategory | "Todas">("Todas");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcInitialCarbs, setCalcInitialCarbs] = useState<number>(0);
  const [cart, setCart] = useState<{ name: string; carbs: number; servings: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const filtered = useMemo(() => {
    let items = carbsDatabase;
    if (activeCategory !== "Todas") {
      items = items.filter((f) => f.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((f) => f.name.toLowerCase().includes(q));
    }
    return items;
  }, [search, activeCategory]);

  const grouped = useMemo(() => {
    const map = new Map<string, FoodItem[]>();
    filtered.forEach((f) => {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    });
    return map;
  }, [filtered]);

  const handleCalcFromFood = (item: FoodItem) => {
    const carbs = parseFloat(getCarbGrams(item));
    setCalcInitialCarbs(isNaN(carbs) ? 0 : carbs);
    setCalcOpen(true);
  };

  const addToCart = (item: FoodItem) => {
    const carbs = parseFloat(getCarbGrams(item));
    if (isNaN(carbs)) return;
    setCart((prev) => {
      const existing = prev.find((p) => p.name === item.name);
      if (existing) {
        return prev.map((p) => p.name === item.name ? { ...p, servings: p.servings + 1 } : p);
      }
      return [...prev, { name: item.name, carbs, servings: 1 }];
    });
  };

  const updateServings = (name: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) => p.name === name ? { ...p, servings: p.servings + delta } : p)
        .filter((p) => p.servings > 0)
    );
  };

  const removeFromCart = (name: string) => {
    setCart((prev) => prev.filter((p) => p.name !== name));
  };

  const totalCarbs = cart.reduce((s, p) => s + p.carbs * p.servings, 0);
  const cartItemCount = cart.reduce((s, p) => s + p.servings, 0);

  const handleCalcFromCart = () => {
    if (cart.length === 0) return;
    setCalcInitialCarbs(Math.round(totalCarbs));
    setCartOpen(false);
    setCalcOpen(true);
  };

  return (
    <div className="min-h-screen pb-28 px-5 pt-6 max-w-md mx-auto">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-foreground mb-1"
      >
        Tabla de Carbohidratos
      </motion.h1>
      <p className="text-sm text-muted-foreground mb-5">
        Fuente: Fundación para la Salud · 1 ración HC = 10g
      </p>

      {/* Search */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative mb-4"
      >
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar alimento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-muted/50 border border-border rounded-button py-3.5 pl-12 pr-4 text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </motion.div>

      {/* Category chips */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide"
      >
        <button
          onClick={() => setActiveCategory("Todas")}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeCategory === "Todas"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/60 text-muted-foreground"
          }`}
        >
          Todas
        </button>
        {foodCategories.map((cat) => {
          const Icon = categoryIcons[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground"
              }`}
            >
              <Icon size={14} />
              {cat}
            </button>
          );
        })}
      </motion.div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-3">
        {filtered.length} alimentos encontrados
      </p>

      {/* Grouped results */}
      <div className="space-y-3">
        {Array.from(grouped.entries()).map(([category, items]) => {
          const Icon = categoryIcons[category as FoodCategory] || UtensilsCrossed;
          const isExpanded = expandedCategory === category || activeCategory !== "Todas" || search.trim().length > 0;

          return (
            <motion.div
              key={category}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card rounded-outer overflow-hidden"
            >
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-button bg-primary/15 flex items-center justify-center">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">{category}</p>
                    <p className="text-xs text-muted-foreground">{items.length} alimentos</p>
                  </div>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3">
                      {/* Header row */}
                      <div className="grid grid-cols-[1fr_45px_45px_40px_28px] gap-1 pb-2 border-b border-border mb-1">
                        <span className="text-[10px] font-semibold text-muted-foreground">Alimento</span>
                        <span className="text-[10px] font-semibold text-muted-foreground text-center">Cant.</span>
                        <span className="text-[10px] font-semibold text-muted-foreground text-center">HC(g)</span>
                        <span className="text-[10px] font-semibold text-muted-foreground text-center">I.G.</span>
                        <span className="text-[10px] font-semibold text-muted-foreground text-center"></span>
                      </div>

                      {items.map((item, i) => {
                        const carbG = getCarbGrams(item);
                        return (
                          <motion.div
                            key={item.name}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="grid grid-cols-[1fr_45px_45px_40px_28px] gap-1 py-2.5 border-b border-border/50 last:border-0 items-center"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {item.measure !== "-" ? item.measure : `${item.gramsPerRation}g`}
                              </p>
                            </div>
                            <div className="text-center">
                              <span className="text-xs font-bold text-foreground">
                                {item.gramsPerRation}g
                              </span>
                            </div>
                            <div className="text-center">
                              <span className="text-xs font-bold text-primary">
                                {carbG !== "-" ? `${carbG}g` : "-"}
                              </span>
                            </div>
                            <div className="text-center">
                              <span className={`text-xs font-bold ${giColor(item.gi)}`}>
                                {item.gi !== "-" ? item.gi : "-"}
                              </span>
                              <p className={`text-[8px] ${giColor(item.gi)}`}>
                                {giLabel(item.gi)}
                              </p>
                            </div>
                            <button
                              onClick={() => addToCart(item)}
                              disabled={carbG === "-"}
                              className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center disabled:opacity-30"
                              title="Agregar a la comida"
                            >
                              <Plus size={14} className="text-primary" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Sparkles size={40} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-lg font-semibold text-muted-foreground">No se encontraron alimentos</p>
          <p className="text-sm text-muted-foreground">Intenta con otro término de búsqueda</p>
        </div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 glass-card rounded-inner p-4"
      >
        <p className="text-xs font-bold text-foreground mb-2">Columnas de la tabla</p>
        <div className="space-y-1 text-xs text-muted-foreground mb-3">
          <p><span className="font-semibold text-foreground">Cant.</span> = Gramos de alimento que equivalen a 1 ración</p>
          <p><span className="font-semibold text-foreground">HC(g)</span> = Gramos de carbohidratos en la medida habitual</p>
          <p><span className="font-semibold text-foreground">I.G.</span> = Índice glucémico</p>
        </div>
        <p className="text-xs font-bold text-foreground mb-2">Índice Glucémico</p>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Bajo (≤55)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Moderado (56-69)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Alto (≥70)</span>
          </span>
        </div>
      </motion.div>

      {/* Floating Calculate Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={() => { setCalcInitialCarbs(0); setCalcOpen(true); }}
        className="w-full mt-6 bg-primary text-primary-foreground rounded-button py-5 text-xl font-bold soft-press flex items-center justify-center gap-3"
      >
        <Calculator size={22} />
        Calcular Insulina
      </motion.button>

      <InsulinCalcDialog
        open={calcOpen}
        onOpenChange={setCalcOpen}
        initialCarbs={calcInitialCarbs}
      />
    </div>
  );
};

export default FoodLog;
