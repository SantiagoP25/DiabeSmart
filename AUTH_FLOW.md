# 🔐 Flujo de Autenticación - DiabeSmart

## 📋 Descripción General

El sistema de autenticación de DiabeSmart tiene un flujo claro y seguro:

1. **Registro** → email + contraseña
2. **Auto-login** → Acceso inmediato después del registro
3. **Onboarding** → Configuración inicial del perfil
4. **Persistencia** → Los datos se guardan en Supabase y se recuperan al volver a entrar

## 🚀 Flujo para Usuario Nuevo

```
┌─────────────────────────────┐
│   Usuario abre la app       │
└──────────────┬──────────────┘
               ↓
         ┌──────────────┐
         │  Página Auth │
         └──────┬───────┘
                ↓
    ┌───────────────────────┐
    │ Clickea "Registrarse" │
    └───────────┬───────────┘
                ↓
    ┌───────────────────────────────┐
    │ Ingresa email + contraseña    │
    │ (SIN nombre - ¡cambio nuevo!) │
    └───────────┬───────────────────┘
                ↓
    ┌───────────────────────────┐
    │ Clickea "Crear cuenta"    │
    └───────────┬───────────────┘
                ↓
    ┌───────────────────────────────────┐
    │ ✅ Cuenta creada en Supabase      │
    │ ✅ Auto-login automático          │
    │ ✅ Perfil vacío creado            │
    └───────────┬───────────────────────┘
                ↓
    ┌───────────────────────┐
    │ Sistema detecta:       │
    │ isProfileComplete = NO│
    └───────────┬───────────┘
                ↓
    ┌──────────────────────────────┐
    │  Redirige a Onboarding       │
    └───────────┬──────────────────┘
                ↓
    ┌──────────────────────────────────┐
    │  PASO 1: Datos Básicos           │
    │  - Tu nombre                     │
    │  - Peso (kg)                     │
    │  - Altura (cm)                   │
    └───────────┬──────────────────────┘
                ↓
    ┌──────────────────────────────────┐
    │  PASO 2: Tu Diabetes             │
    │  - Tipo de diabetes              │
    │  - Fecha de debut                │
    │  - Ratio de insulina             │
    └───────────┬──────────────────────┘
                ↓
    ┌──────────────────────────────────┐
    │  PASO 3: Rango Objetivo          │
    │  - Glucosa mín - máx (mg/dL)     │
    └───────────┬──────────────────────┘
                ↓
    ┌──────────────────────────────────┐
    │ Clickea "Comenzar"               │
    └───────────┬──────────────────────┘
                ↓
    ┌──────────────────────────────────┐
    │ ✅ Datos guardados en Supabase    │
    │ ✅ isProfileComplete = SÍ        │
    └───────────┬──────────────────────┘
                ↓
    ┌──────────────────────────┐
    │  🏠 Dashboard            │
    │  (¡Listo para usar!)     │
    └──────────────────────────┘
```

## 🔄 Flujo para Usuario Existente

```
┌──────────────────────────────┐
│  Usuario abre la app         │
└──────────┬───────────────────┘
           ↓
     ┌──────────────┐
     │  Página Auth │
     └──────┬───────┘
            ↓
  ┌──────────────────────┐
  │ Clickea "Iniciar     │
  │ sesión"              │
  └──────┬───────────────┘
         ↓
  ┌──────────────────────────────┐
  │ Ingresa email + contraseña   │
  └──────┬───────────────────────┘
         ↓
  ┌──────────────────────────────┐
  │ Clickea "Iniciar sesión"     │
  └──────┬───────────────────────┘
         ↓
  ┌────────────────────────────────┐
  │ ✅ Login exitoso               │
  │ ✅ Datos recuperados de BD     │
  └──────┬────────────────────────┘
         ↓
  ┌────────────────────────────────┐
  │ Sistema detecta:               │
  │ isProfileComplete = SÍ         │
  │ (todos los datos ya están en BD)│
  └──────┬────────────────────────┘
         ↓
  ┌────────────────┐
  │ 🏠 Dashboard   │
  │ (Directo!)     │
  └────────────────┘

  ⏭️  SE SALTA COMPLETAMENTE EL ONBOARDING
```

## 💾 Persistencia de Datos

### ¿Dónde se guardan los datos?
- **Supabase** → Tabla `profiles`
- **localStorage** → Token de sesión (manejado por Supabase automáticamente)

### ¿Cómo se recuperan los datos?
1. Usuario inicia sesión
2. `AuthContext` obtiene la sesión de Supabase
3. `useProfile` detecta que hay un usuario autenticado
4. `useProfile` consulta la tabla `profiles` por los datos del usuario
5. Si los datos están completos → va al Dashboard
6. Si falta información → muestra Onboarding

### ¿Qué ocurre si cierro la aplicación y la abro nuevamente?
1. `AuthContext` verifica automáticamente si hay sesión activa (localStorage)
2. Si hay sesión → se restaura automáticamente
3. `useProfile` recupera los datos de la BD
4. Va directamente al Dashboard (porque ya completó el onboarding)

## 📱 Archivos Modificados

### 1. `src/pages/Auth.tsx`
**Cambios:**
- Removido campo `displayName` del registro
- Añadido lógica de auto-login después del signup
- El registro solo pide: email + contraseña

**Flujo de signup:**
```typescript
const signUpData = await supabase.auth.signUp({ email, password })
// ↓ Si el signup fue exitoso...
const signInData = await supabase.auth.signInWithPassword({ email, password })
// ↓ Auto-login sucede automáticamente
```

### 2. `src/App.tsx`
**Cambios:**
- Removido estado local `onboardingDone` (era volátil)
- Ahora depende completamente de `isProfileComplete` 
- Si `isProfileComplete === false` → muestra Onboarding
- Si `isProfileComplete === true` → va al Dashboard

### 3. `supabase/migrations/20260403230907_*.sql`
**Cambios:**
- Actualizado trigger `handle_new_user()`
- Antes: Establecía `display_name = email`
- Ahora: Solo crea el perfil vacío
- Resultado: Fuerza al usuario a completar el onboarding

## 🔒 Seguridad

- ✅ Las contraseñas se hashean en Supabase (nunca se envían sin encriptar)
- ✅ La sesión se almacena de forma segura con tokens JWT
- ✅ Row Level Security (RLS) garantiza que cada usuario solo vea sus propios datos
- ✅ `emailRedirectTo` en signup redirige al usuario a la app después de confirmar email

## 🧪 Cómo Probar

### Escenario 1: Usuario Nuevo
1. Abre la app
2. Clickea "Registrarse"
3. Ingresa un email nuevo y contraseña
4. Debería ir automáticamente al Onboarding
5. Completa el onboarding
6. Debería ir al Dashboard

### Escenario 2: Volver a Entrar
1. Cierra la app (o limpia la sesión)
2. Abre la app nuevamente
3. Clickea "Iniciar sesión"
4. Ingresa las mismas credenciales
5. Debería ir DIRECTAMENTE al Dashboard (sin onboarding)

## 📝 Notas Importantes

- La migración SQL necesita ejecutarse en Supabase después de estos cambios
- Los usuarios que se registren DESPUÉS de la migración usarán el nuevo flujo
- Los usuarios existentes no se verán afectados
- El Onboarding puede ser re-visitado desde Perfil si es necesario

## 🐛 Troubleshooting

### Problema: "No puedo registrarme"
- Verifica que Supabase esté funcionando
- Verifica que el email sea válido y único
- Verifica que la contraseña cumpla los requisitos (mínimo 6 caracteres)

### Problema: "Veo el Onboarding después de completarlo"
- Verifica que los datos se guardaron en BD (Profile page)
- Si no se guardaron, revisa la consola para errores

### Problema: "No me redirige al Dashboard después del Onboarding"
- Verifica que `refetch()` se ejecutó correctamente
- Revisa que `isProfileComplete` ahora sea `true`
