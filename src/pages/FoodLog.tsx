import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, ChevronDown, Milk, Wheat, Apple, Carrot, Nut, GlassWater, UtensilsCrossed } from "lucide-react";
import { carbsDatabase, foodCategories, type FoodItem, type FoodCategory } from "@/data/carbsDatabase";

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

const FoodLog = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FoodCategory | "Todas">("Todas");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
                    <div className="px-4 pb-3">
                      {/* Header row */}
                      <div className="grid grid-cols-[1fr_60px_50px] gap-2 pb-2 border-b border-border mb-2">
                        <span className="text-xs font-semibold text-muted-foreground">Alimento</span>
                        <span className="text-xs font-semibold text-muted-foreground text-center">Ración</span>
                        <span className="text-xs font-semibold text-muted-foreground text-center">I.G.</span>
                      </div>

                      {items.map((item, i) => (
                        <motion.div
                          key={item.name}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="grid grid-cols-[1fr_60px_50px] gap-2 py-2.5 border-b border-border/50 last:border-0 items-center"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {item.measure !== "-" ? item.measure : `${item.gramsPerRation}g = 1 ración`}
                            </p>
                          </div>
                          <div className="text-center">
                            <span className="text-sm font-bold text-foreground">
                              {item.rations !== "-" && item.rations !== "No valorable" ? item.rations : "-"}
                            </span>
                            <p className="text-[10px] text-muted-foreground">HC</p>
                          </div>
                          <div className="text-center">
                            <span className={`text-sm font-bold ${giColor(item.gi)}`}>
                              {item.gi !== "-" ? item.gi : "-"}
                            </span>
                            <p className={`text-[10px] ${giColor(item.gi)}`}>
                              {giLabel(item.gi)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
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
        <p className="text-xs font-bold text-foreground mb-2">Índice Glucémico (I.G.)</p>
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
    </div>
  );
};

export default FoodLog;
