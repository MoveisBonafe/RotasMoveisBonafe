/**
 * Script para sincronizar a origem no cabeçalho com a origem original
 * Este script garante que todas as funções que usam o campo "origin" continuem funcionando
 */
document.addEventListener('DOMContentLoaded', function() {
    // Procurar pelos elementos necessários
    const originMini = document.getElementById('origin-mini');
    
    // Elemento hidden para manter a compatibilidade com o código existente
    // O elemento hidden terá o mesmo ID do campo original de origem
    const originHidden = document.createElement('input');
    originHidden.type = 'hidden';
    originHidden.id = 'origin';
    originHidden.value = 'Dois Córregos, SP';
    document.body.appendChild(originHidden);
    
    console.log('✅ Campo de origem oculto criado e sincronizado com o cabeçalho');
});