import { LanguageCode } from "./languages";

type Dict = Record<string, string>;

const es: Dict = {
  "common.save": "Guardar",
  "common.cancel": "Cancelar",
  "common.loading": "Cargando...",
  "common.share": "Compartir",
  "profile.title": "Mi Perfil",
  "profile.memberSince": "Miembro desde",
  "profile.info": "Información",
  "profile.language": "Idioma preferente",
  "profile.languageHelp": "Idioma para la interfaz y las respuestas de la IA.",
  "profile.languageSaved": "Idioma actualizado",
  "nav.home": "Inicio",
  "nav.journal": "Diario",
  "nav.chart": "Carta",
  "nav.spreads": "Tiradas",
  "nav.profile": "Perfil",
};

const en: Dict = {
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.loading": "Loading...",
  "common.share": "Share",
  "profile.title": "My Profile",
  "profile.memberSince": "Member since",
  "profile.info": "Information",
  "profile.language": "Preferred language",
  "profile.languageHelp": "Language for the interface and AI responses.",
  "profile.languageSaved": "Language updated",
  "nav.home": "Home",
  "nav.journal": "Journal",
  "nav.chart": "Chart",
  "nav.spreads": "Spreads",
  "nav.profile": "Profile",
};

const de: Dict = {
  "common.save": "Speichern",
  "common.cancel": "Abbrechen",
  "common.loading": "Lädt...",
  "common.share": "Teilen",
  "profile.title": "Mein Profil",
  "profile.memberSince": "Mitglied seit",
  "profile.info": "Informationen",
  "profile.language": "Bevorzugte Sprache",
  "profile.languageHelp": "Sprache für die Oberfläche und KI-Antworten.",
  "profile.languageSaved": "Sprache aktualisiert",
  "nav.home": "Start",
  "nav.journal": "Tagebuch",
  "nav.chart": "Karte",
  "nav.spreads": "Legungen",
  "nav.profile": "Profil",
};

const pl: Dict = {
  "common.save": "Zapisz",
  "common.cancel": "Anuluj",
  "common.loading": "Ładowanie...",
  "common.share": "Udostępnij",
  "profile.title": "Mój Profil",
  "profile.memberSince": "Członek od",
  "profile.info": "Informacje",
  "profile.language": "Preferowany język",
  "profile.languageHelp": "Język interfejsu i odpowiedzi AI.",
  "profile.languageSaved": "Język zaktualizowany",
  "nav.home": "Start",
  "nav.journal": "Dziennik",
  "nav.chart": "Karta",
  "nav.spreads": "Rozkłady",
  "nav.profile": "Profil",
};

const pt: Dict = {
  "common.save": "Salvar",
  "common.cancel": "Cancelar",
  "common.loading": "Carregando...",
  "common.share": "Compartilhar",
  "profile.title": "Meu Perfil",
  "profile.memberSince": "Membro desde",
  "profile.info": "Informações",
  "profile.language": "Idioma preferido",
  "profile.languageHelp": "Idioma para a interface e respostas da IA.",
  "profile.languageSaved": "Idioma atualizado",
  "nav.home": "Início",
  "nav.journal": "Diário",
  "nav.chart": "Mapa",
  "nav.spreads": "Tiragens",
  "nav.profile": "Perfil",
};

export const dictionaries: Record<LanguageCode, Dict> = { es, en, de, pl, pt };
