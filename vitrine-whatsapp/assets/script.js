/**
 * Contador de Ofertas Temporizadas para Æonix Digital
 * Gerencia o contador regressivo e atualiza os preços com desconto
 */

document.addEventListener('DOMContentLoaded', function() {
  // Configuração da oferta
  const configOferta = {
    // Define o tempo de expiração (24 horas a partir de agora)
    tempoExpiracao: new Date().getTime() + (24 * 60 * 60 * 1000),
    descontoPercentual: 20, // 20% de desconto
    ofertaAtiva: true // Controle se a oferta está ativa
  };

  // Elementos do DOM
  const ofertaTemporada = document.querySelector('.oferta-temporada');
  const contadorElemento = document.querySelector('.contador-oferta');
  const cardsProdutos = document.querySelectorAll('.card');

  // Verifica se a seção de oferta temporária existe
  if (!ofertaTemporada) return;

  /**
   * Formata um número para ter sempre 2 dígitos
   * @param {number} num - Número a ser formatado
   * @returns {string} Número formatado com 2 dígitos
   */
  function formatarDoisDigitos(num) {
    return num < 10 ? `0${num}` : num;
  }

  /**
   * Aplica desconto nos preços dos produtos
   */
  function aplicarDescontos() {
    cardsProdutos.forEach(card => {
      // Pula cards esgotados
      if (card.classList.contains('esgotado')) return;
      
      // Se já tiver desconto aplicado, pula
      if (card.querySelector('.preco-com-desconto')) return;
      
      // Encontra todos os itens de lista no card
      const itens = card.querySelectorAll('li');
      
      itens.forEach(item => {
        const texto = item.innerHTML; // Usa innerHTML para manter a formatação
        
        // Procura por padrões de preço no formato R$ X,XX ou R$ X.XXX,XX
        const regex = /(R\$\s*)(\d{1,3}(?:\.?\d{3})*(?:,\d{2})?)/g;
        let novoHTML = texto;
        let match;
        let aplicouDesconto = false;
        
        // Encontra e substitui todos os preços no texto
        while ((match = regex.exec(texto)) !== null) {
          const [valorCompleto, simbolo, valor] = match;
          const precoOriginal = parseFloat(valor.replace(/\./g, '').replace(',', '.'));
          
          if (!isNaN(precoOriginal)) {
            aplicouDesconto = true;
            const precoComDesconto = precoOriginal * (1 - (configOferta.descontoPercentual / 100));
            
            // Formata o preço com desconto
            const precoFormatado = precoComDesconto.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            });
            
            // Adiciona o preço com desconto ao lado do preço original
            novoHTML = novoHTML.replace(
              valorCompleto,
              `${simbolo} <span class="preco-original">${valor}</span> <span class="preco-com-desconto">${precoFormatado}</span> <span class="badge-desconto">${configOferta.descontoPercentual}% OFF</span>`
            );
          }
        }
        
        // Atualiza o HTML apenas se algum desconto foi aplicado
        if (aplicouDesconto) {
          item.innerHTML = novoHTML;
        }
      });
    });
  }

  /**
   * Atualiza o contador regressivo
   */
  function atualizarContador() {
    const agora = new Date().getTime();
    const diferenca = configOferta.tempoExpiracao - agora;

    // Verifica se o tempo expirou
    if (diferenca <= 0) {
      contadorElemento.innerHTML = '<div class="tempo-esgotado">Oferta encerrada!</div>';
      ofertaTemporada.classList.remove('urgente');
      ofertaTemporada.classList.add('expirada');
      return;
    }

    // Calcula horas, minutos e segundos
    const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    // Atualiza o DOM
    document.getElementById('horas').textContent = formatarDoisDigitos(horas);
    document.getElementById('minutos').textContent = formatarDoisDigitos(minutos);
    document.getElementById('segundos').textContent = formatarDoisDigitos(segundos);

    // Adiciona efeito de urgência quando faltar menos de 1 minuto
    if (horas === 0 && minutos < 1) {
      ofertaTemporada.classList.add('urgente');
    } else {
      ofertaTemporada.classList.remove('urgente');
    }
  }

  /**
   * Inicializa o contador de ofertas
   */
  function iniciarContadorOfertas() {
    // Aplica os descontos iniciais
    if (configOferta.ofertaAtiva) {
      aplicarDescontos();
    }
    
    // Atualiza o contador imediatamente e depois a cada segundo
    atualizarContador();
    const intervalo = setInterval(atualizarContador, 1000);
    
    // Limpa o intervalo quando a oferta expirar
    setTimeout(() => {
      clearInterval(intervalo);
    }, configOferta.tempoExpiracao - new Date().getTime() + 1000);
  }

  // Inicializa o contador quando o DOM estiver carregado
  iniciarContadorOfertas();
});