import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Aviso Importante
            </h3>
            <p className="mt-4 text-sm text-gray-500">
              Este aplicativo não substitui o atendimento psicológico profissional.
              Em caso de emergência, entre em contato com o CVV (188) ou procure
              ajuda profissional.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Links Úteis
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="https://www.cvv.org.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Centro de Valorização da Vida (CVV)
                </a>
              </li>
              <li>
                <a
                  href="https://site.cfp.org.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Conselho Federal de Psicologia
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Contato
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-gray-500">
                Email: d_pereira@outlook.com.br
              </li>
              <li className="text-sm text-gray-500">
                Telefone: (11) 96468-5433
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Eudaimonia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;