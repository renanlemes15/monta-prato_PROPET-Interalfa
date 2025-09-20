import React, { useState, useCallback, useEffect } from 'react';

const URLS_IMAGENS = {
  basePrato: '/assets/prato-base.png',
  arroz: '/assets/arroz.png',
  feijao: '/assets/feijao.png',
  salada: '/assets/salada.png',
  proteina: '/assets/proteina.png',
};


const useCarregarImagem = (url) => {
  const [imagem, setImagem] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!url) {
      setStatus('error');
      return;
    }
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImagem(img);
      setStatus('loaded');
    };
    img.onerror = (e) => {
      console.error(`Erro ao carregar imagem: ${url}`, e);
      setStatus('error');
    };
  }, [url]);

  return [imagem, status];
};

const SliderAlimento = ({ rotulo, valor, aoMudar, cor }) => (
  <div className="mb-6 w-full px-4">
    <label className="block text-gray-800 text-lg font-semibold mb-2">
      {rotulo}
    </label>
    <input
      type="range"
      min="0"
      max="100"
      value={valor}
      onChange={(e) => aoMudar(parseFloat(e.target.value))}
      className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer shadow-inner accent-current"
      style={{ accentColor: cor }}
    />
  </div>
);


const paraRadianos = (graus) => graus * (Math.PI / 180);

const GraficoPratoSVG = ({ proporcoes, imagensAlimentos, imagemPratoBase, tamanhoPalcoProp }) => {
  const tamanhoPalco = tamanhoPalcoProp;
  const centro = tamanhoPalco / 2;
  const raio = tamanhoPalco * 0.375;
  const tamanhoImagemPratoBase = tamanhoPalco * 0.75;

  let anguloAtual = 0;

  const ordemAlimentos = ['arroz', 'feijao', 'salada', 'proteina'];
  const total = Object.values(proporcoes).reduce((soma, val) => soma + val, 0) || 1;

  const dadosFatias = ordemAlimentos.map((tipoAlimento) => {
    const proporcao = proporcoes[tipoAlimento] / total;
    const anguloFatia = proporcao * 360;

    if (anguloFatia <= 0) {
      return null;
    }

    const startAngleRad = paraRadianos(anguloAtual);
    const endAngleRad = paraRadianos(anguloAtual + anguloFatia);

    const x1 = centro + raio * Math.cos(startAngleRad);
    const y1 = centro + raio * Math.sin(startAngleRad);
    const x2 = centro + raio * Math.cos(endAngleRad);
    const y2 = centro + raio * Math.sin(endAngleRad);

    const largeArcFlag = anguloFatia > 180 ? 1 : 0;

    const pathData = [
      `M ${centro},${centro}`,
      `L ${x1},${y1}`,
      `A ${raio},${raio} 0 ${largeArcFlag} 1 ${x2},${y2}`,
      `Z`,
    ].join(' ');

    const fatiaData = {
      tipoAlimento,
      pathData,
      anguloFatia,
    };
    anguloAtual += anguloFatia;
    return fatiaData;
  }).filter(Boolean);

  return (
    <div className="relative mx-auto bg-gray-50 rounded-full shadow-lg overflow-hidden" style={{ width: tamanhoPalco, height: tamanhoPalco }}>
      <svg width={tamanhoPalco} height={tamanhoPalco} viewBox={`0 0 ${tamanhoPalco} ${tamanhoPalco}`}>
        <circle
          cx={centro}
          cy={centro}
          r={raio + (tamanhoPalco * 0.05)}
          fill="#e0e0e0"
          filter="url(#sombraPrato)"
        />

        <defs>
          <filter id="sombraPrato" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx={tamanhoPalco * 0.0075} dy={tamanhoPalco * 0.0075} stdDeviation={tamanhoPalco * 0.00625} floodColor="rgba(0,0,0,0.2)" />
          </filter>

          {dadosFatias.map((fatia) => (
            <clipPath id={`clip-${fatia.tipoAlimento}`} key={`clip-${fatia.tipoAlimento}`}>
              <path d={fatia.pathData} />
            </clipPath>
          ))}
        </defs>

        {imagemPratoBase && (
          <image
            href={URLS_IMAGENS.basePrato}
            x={centro - tamanhoImagemPratoBase / 2}
            y={centro - tamanhoImagemPratoBase / 2}
            width={tamanhoImagemPratoBase}
            height={tamanhoImagemPratoBase}
            preserveAspectRatio="xMidYMid slice"
          />
        )}

        {dadosFatias.map((fatia) => (
          <image
            key={`img-${fatia.tipoAlimento}`}
            href={URLS_IMAGENS[fatia.tipoAlimento]}
            x={0}
            y={0}
            width={tamanhoPalco}
            height={tamanhoPalco}
            clipPath={`url(#clip-${fatia.tipoAlimento})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ))}
      </svg>
    </div>
  );
};


const MontarPratoPage = ({
  percentuaisAlimentos,
  setPercentuaisAlimentos,
  tamanhoPalcoDinamico,
  imagensAlimentos,
  imagemPratoBase,
  setMensagem,
  setMostrarModal,
}) => {
  const coresAlimentos = {
    arroz: '#FFD700',
    feijao: '#8B4513',
    salada: '#32CD32',
    proteina: '#DC143C',
  };

  const aoMudarSlider = useCallback((tipoAlimento, novoValor) => {
    setPercentuaisAlimentos(prevPercentuais => ({
      ...prevPercentuais,
      [tipoAlimento]: novoValor,
    }));
  }, [setPercentuaisAlimentos]);

  const enviarPratoParaBackend = async () => {
    let somaAtual = Object.values(percentuaisAlimentos).reduce((soma, val) => soma + val, 0);
    const pratoParaEnviar = {};

    if (somaAtual === 0) {
      for (const alimento in percentuaisAlimentos) {
        pratoParaEnviar[alimento] = 0;
      }
    } else {
      const fatorNormalizacao = 100 / somaAtual;
      for (const alimento in percentuaisAlimentos) {
        pratoParaEnviar[alimento] = Math.round(percentuaisAlimentos[alimento] * fatorNormalizacao);
      }

      let somaAposArredondamento = Object.values(pratoParaEnviar).reduce((soma, val) => soma + val, 0);
      let diferenca = 100 - somaAposArredondamento;

      if (diferenca !== 0) {
        const alimentosArray = Object.keys(pratoParaEnviar);
        for (let i = 0; i < Math.abs(diferenca); i++) {
          const alimentoParaAjustar = alimentosArray[i % alimentosArray.length];
          if (diferenca > 0) {
            pratoParaEnviar[alimentoParaAjustar]++;
          } else {
            if (pratoParaEnviar[alimentoParaAjustar] > 0) {
              pratoParaEnviar[alimentoParaAjustar]--;
            }
          }
        }
      }
    }

    try {
      console.log('Dados a serem enviados para o backend:', pratoParaEnviar);
      
      const response = await fetch('http://localhost:8080/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pratoParaEnviar),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar prato para o backend.');
      }

      const resultado = await response.json();
      console.log('Resposta do backend:', resultado);
      
      setMensagem('Prato enviado com sucesso');
      setMostrarModal(true);
    } catch (error) {
      console.error('Erro ao enviar prato:', error);
      setMensagem(`Erro ao enviar prato: ${error.message || 'Ocorreu um erro desconhecido.'}`);
      setMostrarModal(true);
    }
  };

  return (
    <>
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">Monte o seu Prato!</h1>

      <GraficoPratoSVG
        proporcoes={percentuaisAlimentos}
        imagensAlimentos={imagensAlimentos}
        imagemPratoBase={imagemPratoBase}
        tamanhoPalcoProp={tamanhoPalcoDinamico}
      />

      <div className="flex flex-col items-center mt-10">
        {Object.entries(percentuaisAlimentos).map(([tipoAlimento, percentual]) => (
          <SliderAlimento
            key={tipoAlimento}
            rotulo={tipoAlimento.charAt(0).toUpperCase() + tipoAlimento.slice(1)}
            valor={percentual}
            aoMudar={(novoValor) => aoMudarSlider(tipoAlimento, novoValor)}
            cor={coresAlimentos[tipoAlimento]}
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={enviarPratoParaBackend}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Enviar Prato
        </button>
      </div>
    </>
  );
};


const EstatisticasPage = ({ tamanhoPalcoDinamico, imagensAlimentos, imagemPratoBase, setMensagem, setMostrarModal }) => {
  const [estatisticasMedias, setEstatisticasMedias] = useState(null);
  const [carregandoEstatisticas, setCarregandoEstatisticas] = useState(false);
  const [erroEstatisticas, setErroEstatisticas] = useState(null);

  const buscarEstatisticas = useCallback(async () => {
    setCarregandoEstatisticas(true);
    setErroEstatisticas(null);
    try {
      const response = await fetch('http://localhost:8080/estatisticas');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar estatísticas.');
      }
      const data = await response.json();
      const formatado = {
        arroz: data.totalArroz || 0,
        feijao: data.totalFeijao || 0,
        salada: data.totalSalada || 0,
        proteina: data.totalProteina || 0,
      };
      setEstatisticasMedias(formatado);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setErroEstatisticas(error.message);
    } finally {
      setCarregandoEstatisticas(false);
    }
  }, []);

  const deletarTodosPratos = async () => {
    setMensagem('Tem certeza que deseja APAGAR TODOS os pratos? Esta ação é irreversível!');
    setMostrarModal(true);
    try {
      const response = await fetch('http://localhost:8080/', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao apagar pratos.');
      }

      setMensagem('Todos os pratos foram apagados com sucesso!');
      setMostrarModal(true);
      setEstatisticasMedias(null);
    } catch (error) {
      console.error('Erro ao apagar pratos:', error);
      setMensagem(`Erro ao apagar pratos: ${error.message || 'Ocorreu um erro desconhecido.'}`);
      setMostrarModal(true);
    }
  };

  useEffect(() => {
    buscarEstatisticas();
  }, [buscarEstatisticas]);

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">Estatísticas dos Pratos</h2>

      {carregandoEstatisticas && <p className="text-gray-600 mb-4">Carregando estatísticas...</p>}
      {erroEstatisticas && <p className="text-red-600 mb-4">Erro: {erroEstatisticas}</p>}

      {estatisticasMedias && Object.values(estatisticasMedias).some(val => val > 0) ? (
        <>
          <GraficoPratoSVG
            proporcoes={estatisticasMedias}
            imagensAlimentos={imagensAlimentos}
            imagemPratoBase={imagemPratoBase}
            tamanhoPalcoProp={tamanhoPalcoDinamico}
          />
          <div className="mt-6 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Média de Composição dos Pratos:</h3>
            {Object.entries(estatisticasMedias).map(([alimento, valor]) => (
              <p key={alimento} className="text-gray-700 text-lg">
                {alimento.charAt(0).toUpperCase() + alimento.slice(1)}: {valor.toFixed(1)}%
              </p>
            ))}
          </div>
        </>
      ) : (
        !carregandoEstatisticas && <p className="text-gray-600 mb-4">Nenhum dado de prato disponível para estatísticas.</p>
      )}

      <div className="flex flex-col md:flex-row gap-4 mt-8 w-full justify-center">
        <button
          onClick={buscarEstatisticas}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Atualizar Estatísticas
        </button>
        <button
          onClick={deletarTodosPratos}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          Apagar Todos os Pratos
        </button>
      </div>
    </div>
  );
};


const App = () => {
  const [percentuaisAlimentos, setPercentuaisAlimentos] = useState({
    arroz: 25,
    feijao: 25,
    salada: 25,
    proteina: 25,
  });
  const [tamanhoPalcoDinamico, setTamanhoPalcoDinamico] = useState(400);
  const [mensagem, setMensagem] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  
  useEffect(() => {
    const calcularTamanhoPalco = () => {
      const larguraMaxima = 350;
      const larguraDisponivel = window.innerWidth * 0.9;
      setTamanhoPalcoDinamico(Math.min(larguraMaxima, larguraDisponivel));
    };
    calcularTamanhoPalco();
    window.addEventListener('resize', calcularTamanhoPalco);
    return () => window.removeEventListener('resize', calcularTamanhoPalco);
  }, []);

  const [imagemPratoBase] = useCarregarImagem(URLS_IMAGENS.basePrato);
  const [imagemArroz] = useCarregarImagem(URLS_IMAGENS.arroz);
  const [imagemFeijao] = useCarregarImagem(URLS_IMAGENS.feijao);
  const [imagemSalada] = useCarregarImagem(URLS_IMAGENS.salada);
  const [imagemProteina] = useCarregarImagem(URLS_IMAGENS.proteina);
  const imagensAlimentos = { arroz: imagemArroz, feijao: imagemFeijao, salada: imagemSalada, proteina: imagemProteina };

  const renderizarPagina = () => {
    switch (window.location.pathname) {
      case '/estatisticas':
        return (
          <EstatisticasPage
            tamanhoPalcoDinamico={tamanhoPalcoDinamico}
            imagensAlimentos={imagensAlimentos}
            imagemPratoBase={imagemPratoBase}
            setMensagem={setMensagem}
            setMostrarModal={setMostrarModal}
          />
        );
      case '/':
      default:
        return (
          <MontarPratoPage
            percentuaisAlimentos={percentuaisAlimentos}
            setPercentuaisAlimentos={setPercentuaisAlimentos}
            tamanhoPalcoDinamico={tamanhoPalcoDinamico}
            imagensAlimentos={imagensAlimentos}
            imagemPratoBase={imagemPratoBase}
            setMensagem={setMensagem}
            setMostrarModal={setMostrarModal}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4 font-inter">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 w-full max-w-md mx-auto transform transition-all duration-300 hover:scale-[1.01]">
        {renderizarPagina()}
      </div>

      {/**/}
      {mostrarModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border-t-4 border-blue-500">
            <p className="text-xl font-semibold text-gray-800 mb-6">{mensagem}</p>
            <button
              onClick={() => setMostrarModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
