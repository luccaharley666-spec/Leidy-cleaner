import React, { useState } from 'react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState(new Set([0])); // Primeiro item aberto por padrão

  const faqs = [
    {
      question: 'Quanto tempo leva um serviço de limpeza?',
      answer: 'O tempo varia conforme o tipo de serviço e tamanho do espaço. Uma limpeza residencial padrão leva de 2-3 horas, enquanto uma limpeza profunda pode levar 4-5 horas. Sempre informamos o tempo estimado no agendamento.'
    },
    {
      question: 'Quais produtos vocês utilizam?',
      answer: 'Utilizamos produtos profissionais eco-friendly, biodegradáveis e seguros para pessoas e animais de estimação. Todos os produtos são aprovados por órgãos reguladores e não danificam superfícies.'
    },
    {
      question: 'Os profissionais são verificados?',
      answer: 'Sim! Todos os nossos profissionais passam por rigorosa verificação de antecedentes, treinamento específico e são segurados. Priorizamos sua segurança e satisfação.'
    },
    {
      question: 'Como funciona o cancelamento?',
      answer: 'Cancelamentos podem ser feitos até 24 horas antes do serviço sem cobrança. Após esse período, poderá haver taxa de cancelamento de 50% do valor do serviço.'
    },
    {
      question: 'Vocês oferecem garantia?',
      answer: 'Sim! Oferecemos garantia de 7 dias para todos os serviços. Se não ficar satisfeito, retornamos para corrigir qualquer problema sem custo adicional.'
    },
    {
      question: 'Qual a área de cobertura?',
      answer: 'Atendemos Porto Alegre e região metropolitana. Para áreas mais distantes, consulte disponibilidade e possíveis taxas extras de deslocamento.'
    },
    {
      question: 'Posso agendar limpeza para hoje?',
      answer: 'Para serviços no mesmo dia, entre em contato diretamente pelo WhatsApp. Temos equipe disponível para emergências e agendamentos de última hora.'
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Aceitamos cartão de crédito, débito, PIX, dinheiro e transferência bancária. O pagamento é realizado após a conclusão do serviço, garantindo sua satisfação.'
    }
  ];

  const toggleItem = (index) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Perguntas Frequentes
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Tire suas dúvidas sobre nossos serviços
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {faq.question}
              </span>
              <span className={ `text-2xl ${openItems.has(index) ? 'rotate-180' : '' }`}>
                ▼
              </span>
            </button>

            {openItems.has(index) && (
              <div className="px-6 pb-4">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Ainda tem dúvidas?
        </p>
        <a
          href="https://wa.me/5551990303740?text=Olá! Tenho uma dúvida sobre os serviços."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          <span>💬</span>
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
};

export default FAQ;