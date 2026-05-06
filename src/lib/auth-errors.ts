// Mapeo de errores de auth a mensajes claros para conflictos de identidades.
// Cubre el caso típico: el mismo email ya está registrado con otro proveedor
// (p.ej. usuario se registró con Google y luego intenta crear cuenta con email/password,
// o viceversa).

export type AuthErrorInfo = {
  message: string;
  hint?: string;
};

const lower = (s: string) => (s || "").toLowerCase();

export function describeSignUpError(error: string): AuthErrorInfo {
  const e = lower(error);
  if (
    e.includes("already registered") ||
    e.includes("already been registered") ||
    e.includes("user already exists") ||
    e.includes("duplicate key") ||
    e.includes("email address is already")
  ) {
    return {
      message: "Este correo ya está registrado.",
      hint: "Si te registraste con Google o Apple, inicia sesión con ese mismo botón. Si usaste contraseña, ingresa con tu contraseña o recupérala.",
    };
  }
  if (e.includes("password") && e.includes("weak")) {
    return { message: "La contraseña es demasiado débil. Usa al menos 8 caracteres con números y letras." };
  }
  if (e.includes("rate limit") || e.includes("too many")) {
    return { message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }
  return { message: error };
}

export function describeSignInError(error: string): AuthErrorInfo {
  const e = lower(error);
  if (e.includes("invalid login credentials") || e.includes("invalid credentials")) {
    return {
      message: "Email o contraseña incorrectos.",
      hint: "Si te registraste con Google o Apple, inicia sesión con ese botón en lugar de usar contraseña.",
    };
  }
  if (e.includes("email not confirmed")) {
    return { message: "Aún no has confirmado tu correo. Revisa tu bandeja de entrada y la carpeta de spam." };
  }
  if (e.includes("rate limit") || e.includes("too many")) {
    return { message: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
  }
  return { message: error };
}

export function describeOAuthError(provider: "google" | "apple", error: unknown): AuthErrorInfo {
  const raw = typeof error === "string" ? error : (error as { message?: string })?.message || "";
  const e = lower(raw);
  const otherProvider = provider === "google" ? "Apple" : "Google";

  if (
    e.includes("identity already exists") ||
    e.includes("identity is already linked") ||
    e.includes("user already exists") ||
    e.includes("email address is already") ||
    e.includes("already registered")
  ) {
    return {
      message: `Este correo ya tiene una cuenta con otro método.`,
      hint: `Intenta iniciar sesión con ${otherProvider} o con tu contraseña usando el mismo correo.`,
    };
  }
  if (e.includes("popup") || e.includes("closed") || e.includes("cancelled") || e.includes("canceled")) {
    return { message: "Se canceló el inicio de sesión. Inténtalo de nuevo." };
  }
  if (e.includes("network") || e.includes("failed to fetch")) {
    return {
      message: "No se pudo conectar con el proveedor.",
      hint: "Si abriste Astrelle desde Instagram, TikTok o Facebook, abre el enlace en Safari o Chrome para que funcione el inicio de sesión.",
    };
  }
  return {
    message: `No se pudo iniciar sesión con ${provider === "google" ? "Google" : "Apple"}.`,
    hint: "Si tu correo ya está registrado con otro método, inicia sesión con ese método y desde tu perfil podrás vincular ambos.",
  };
}

// Detecta navegadores embebidos (Instagram/TikTok/Facebook) donde Google OAuth suele fallar.
export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /(Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|TikTok|Line|Twitter|MicroMessenger|WeChat)/i.test(ua);
}
