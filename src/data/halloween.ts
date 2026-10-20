/**
 * Fin du theme Halloween 2026 : 1er novembre a 6 h, heure de Martinique
 * (UTC-4, sans heure d'ete). Lue par le script du <head> et par
 * HalloweenHabillage, qui retire le theme d'une page restee ouverte.
 */
export const FIN_HALLOWEEN = Date.parse("2026-11-01T06:00:00-04:00");

/**
 * Pose la classe `halloween` sur <html> AVANT le premier affichage. Fait par
 * le composant client, le basculement aurait montre une seconde le theme
 * normal puis la nuit : un flash a chaque page. L'admin en est exclu.
 */
export const SCRIPT_HALLOWEEN = `if(Date.now()<${FIN_HALLOWEEN}&&!location.pathname.startsWith("/admin"))document.documentElement.classList.add("halloween")`;
