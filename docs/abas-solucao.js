/**
 * SOLUÇÃO DEFINITIVA PARA O PROBLEMA DAS ABAS - VERSÃO GITHUB PAGES
 * Este script substitui completamente a funcionalidade das abas inferiores
 * usando uma abordagem simples e direta via DOM
 */

(function() {
  // Executar quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando solução definitiva para abas - abas-solucao.js');
    
    // Aplicar estilo CSS necessário
    aplicarEstiloCSS();
    
    // Substituir o comportamento completo das abas
    substituirAbasInferiores();
  });
  
  // Função para aplicar estilo CSS
  function aplicarEstiloCSS() {
    const estiloCSS = `
      /* Estilos para o sistema de abas simplificado */
      .nova-navegacao-abas {
        display: flex;
        background: #f8f9fa;
        border-bottom: 1px solid #e9ecef;
      }
      
      .nova-botao-aba {
        flex: 1;
        padding: 12px;
        text-align: center;
        background: none;
        border: none;
        color: #555;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .nova-botao-aba.ativo {
        background: #fff;
        color: #ff9800;
        border-bottom: 3px solid #ff9800;
      }
      
      .nova-botao-aba:hover {
        background: rgba(255,255,255,0.8);
      }
      
      .nova-conteudo-aba {
        display: none;
        padding: 20px;
        background: white;
      }
      
      .nova-conteudo-aba.ativo {
        display: block;
      }
    `;
    
    // Adicionar o estilo à página
    const styleElement = document.createElement('style');
    styleElement.textContent = estiloCSS;
    document.head.appendChild(styleElement);
  }
  
  // Função para substituir as abas inferiores
  function substituirAbasInferiores() {
    // Encontrar o container das abas
    const abasContainer = document.querySelector('.bottom-tabs-container');
    
    if (!abasContainer) {
      console.error('Container de abas não encontrado');
      return;
    }
    
    // Verificar se já foi processado
    if (abasContainer.getAttribute('data-fixed') === 'true') {
      console.log('Abas já foram processadas');
      return;
    }
    
    // Marcar como processado
    abasContainer.setAttribute('data-fixed', 'true');
    abasContainer.classList.remove('minimized');
    
    // Limpar o conteúdo original
    abasContainer.innerHTML = '';
    
    // Criar a nova navegação de abas
    const navAbas = document.createElement('div');
    navAbas.className = 'nova-navegacao-abas';
    
    // Adicionar os botões de navegação
    const botoes = [
      {id: 'aba-eventos', texto: 'Eventos na Rota'},
      {id: 'aba-restricoes', texto: 'Restrições de Tráfego'},
      {id: 'aba-relatorio', texto: 'Relatório da Rota'}
    ];
    
    botoes.forEach((botao, index) => {
      const btn = document.createElement('button');
      btn.className = 'nova-botao-aba' + (index === 0 ? ' ativo' : '');
      btn.textContent = botao.texto;
      btn.onclick = function() {
        alternarAba(botao.id);
      };
      navAbas.appendChild(btn);
    });
    
    abasContainer.appendChild(navAbas);
    
    // Criar os conteúdos das abas
    const conteudos = [
      {
        id: 'aba-eventos',
        titulo: 'Eventos nas cidades da rota:',
        conteudo: `
          <div style="width: 100%; min-height: 300px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); padding: 15px;">
            <div id="events-list">
              <p class="text-muted">Nenhum evento encontrado. Adicione locais e otimize a rota para ver eventos nas cidades do percurso.</p>
            </div>
          </div>
        `
      },
      {
        id: 'aba-restricoes',
        titulo: 'Restrições para caminhões do percurso:',
        conteudo: `
          <p class="small text-muted mb-3">Filtrando para: caminhão de 1 eixo, 2 eixos, truck, comercial e toco</p>
          <div style="width: 100%; min-height: 300px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); padding: 15px;">
            <div id="restrictions-list">
              <p class="text-muted">Nenhuma restrição encontrada. Adicione locais e otimize a rota para ver restrições nas cidades do percurso.</p>
            </div>
          </div>
        `
      },
      {
        id: 'aba-relatorio',
        titulo: 'Relatório da rota otimizada:',
        conteudo: `
          <div id="route-summary" class="mb-4" style="width: 100%; min-height: 300px; background-color: #fff8e1; border-radius: 8px; border: 1px solid #ffe082; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
            <p class="text-muted">Otimize uma rota para ver o relatório detalhado.</p>
          </div>
          
          <div class="form-group mt-4">
            <label class="date-range-label">Nome da rota:</label>
            <div class="input-animation-container position-relative">
              <input type="text" id="report-route-name" placeholder="Ex: Entrega Região Sul" 
                     style="border: 1px solid #ffe082; border-radius: 8px; padding: 10px 12px; width: 100%; background-color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.04);">
            </div>
          </div>
          <div class="d-flex justify-content-between mt-4">
            <button id="save-report-btn" class="btn btn-primary" style="background: linear-gradient(135deg, #ff9800, #ff5722); border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: all 0.3s ease;">
              Salvar Relatório
            </button>
            <button id="share-route-btn" class="btn btn-outline-secondary" style="border: 1px solid #ddd; background: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; transition: all 0.3s ease;">
              Compartilhar
            </button>
          </div>
        `
      }
    ];
    
    conteudos.forEach((item, index) => {
      const conteudoAba = document.createElement('div');
      conteudoAba.id = item.id;
      conteudoAba.className = 'nova-conteudo-aba' + (index === 0 ? ' ativo' : '');
      
      const titulo = document.createElement('h5');
      titulo.style.cssText = 'color: #333; margin-bottom: 15px; font-weight: 600; border-left: 3px solid #ffc107; padding-left: 10px;';
      titulo.textContent = item.titulo;
      
      conteudoAba.appendChild(titulo);
      conteudoAba.insertAdjacentHTML('beforeend', item.conteudo);
      
      abasContainer.appendChild(conteudoAba);
    });
    
    console.log('Abas inferiores substituídas com sucesso');
  }
  
  // Função para alternar entre as abas
  window.alternarAba = function(idAba) {
    // Remover ativo de todos os botões
    document.querySelectorAll('.nova-botao-aba').forEach(btn => {
      btn.classList.remove('ativo');
    });
    
    // Esconder todos os conteúdos
    document.querySelectorAll('.nova-conteudo-aba').forEach(conteudo => {
      conteudo.classList.remove('ativo');
    });
    
    // Ativar o botão correspondente
    const botoes = document.querySelectorAll('.nova-botao-aba');
    for (let i = 0; i < botoes.length; i++) {
      if (botoes[i].textContent.includes(idAba === 'aba-eventos' ? 'Eventos' : 
                                         idAba === 'aba-restricoes' ? 'Restrições' : 'Relatório')) {
        botoes[i].classList.add('ativo');
        break;
      }
    }
    
    // Mostrar o conteúdo da aba
    const conteudoAba = document.getElementById(idAba);
    if (conteudoAba) {
      conteudoAba.classList.add('ativo');
    }
  };
})();