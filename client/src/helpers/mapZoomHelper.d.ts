/**
 * Declaração de tipos para mapZoomHelper.js
 */

/**
 * Helper para ajustar o zoom do Google Maps sem necessidade da tecla Ctrl
 * Esta função deve ser chamada após o carregamento do mapa para aplicar as configurações
 */
export function enableSmartZoom(): void;

/**
 * Verifica a presença do mapa periodicamente e aplica o helper de zoom
 * quando o mapa for carregado
 * @param maxAttempts Número máximo de tentativas antes de desistir (cada tentativa dura 500ms)
 */
export function setupZoomHelper(maxAttempts?: number): void;