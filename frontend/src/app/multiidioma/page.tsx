import React from 'react';

export default function MultiIdiomaPage() {
  const [lang, setLang] = React.useState('pt');
  const textos = {
    pt: {
      titulo: 'Multi-idioma',
      descricao: 'Escolha o idioma do site. Esta funcionalidade permite que usuários naveguem em diferentes idiomas.',
      aviso: 'Em breve: tradução automática de todo o conteúdo do site.'
    },
    en: {
      titulo: 'Multi-language',
      descricao: 'Choose the site language. This feature allows users to browse in different languages.',
      aviso: 'Coming soon: automatic translation of all site content.'
    },
    es: {
      titulo: 'Multi-idioma',
      descricao: 'Elija el idioma del sitio. Esta funcionalidad permite a los usuarios navegar en diferentes idiomas.',
      aviso: 'Próximamente: traducción automática de todo el contenido del sitio.'
    }
  };
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">{textos[lang].titulo}</h1>
      <p className="mb-6 text-gray-700">{textos[lang].descricao}</p>
      <div className="flex gap-4">
        <button className={`px-4 py-2 rounded ${lang==='pt'?'bg-blue-600 text-white':'bg-gray-300 text-gray-800'}`} onClick={()=>setLang('pt')}>Português</button>
        <button className={`px-4 py-2 rounded ${lang==='en'?'bg-blue-600 text-white':'bg-gray-300 text-gray-800'}`} onClick={()=>setLang('en')}>English</button>
        <button className={`px-4 py-2 rounded ${lang==='es'?'bg-blue-600 text-white':'bg-gray-300 text-gray-800'}`} onClick={()=>setLang('es')}>Español</button>
      </div>
      <div className="mt-8 text-gray-600">
        <p>{textos[lang].aviso}</p>
      </div>
    </div>
  );
}
