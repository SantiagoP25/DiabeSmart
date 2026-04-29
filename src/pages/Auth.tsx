import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "¡Bienvenido!", description: "Inicio de sesión exitoso" });
      } else {
        // Registrar el usuario
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) {
          const alreadyRegistered = signUpError.message?.toLowerCase().includes("already registered");
          if (alreadyRegistered) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) {
              throw signUpError;
            }

            toast({
              title: "Sesión iniciada",
              description: "Ya tenías cuenta, te hemos iniciado sesión",
            });
            return;
          }

          throw signUpError;
        }

        // Intentar auto-login después del registro
        if (signUpData?.user) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (!signInError) {
            toast({
              title: "¡Cuenta creada!",
              description: "Configura tu perfil para comenzar",
            });
          } else {
            toast({
              title: "Cuenta creada",
              description: "Por favor inicia sesión",
            });
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-background">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-8"
      >
        <img
          src={logo}
          alt="DiabeSmart"
          className="w-24 h-24 rounded-full mb-4 dark:brightness-150 dark:contrast-125"
        />
        <h1 className="text-3xl font-bold text-foreground">DiabeSmart</h1>
        <p className="text-muted-foreground mt-1">Tu control de diabetes inteligente</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <div className="flex rounded-outer bg-muted p-1 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 text-base font-semibold rounded-inner transition-colors ${
              isLogin
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 text-base font-semibold rounded-inner transition-colors ${
              !isLogin
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Mail size={18} className="text-primary" />
              Correo electrónico
            </Label>
            <Input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-base rounded-inner"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Lock size={18} className="text-primary" />
              Contraseña
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base rounded-inner pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-button py-4 text-base font-semibold soft-press disabled:opacity-50"
          >
            {loading
              ? "Cargando..."
              : isLogin
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold underline-offset-2 hover:underline"
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
