import Head from 'next/head';

export default function SEOHead() {
  return (
    <Head>
      <title>LimpezaPro - Limpeza Profissional</title>
      <meta name="description" content="Serviços de limpeza profissional para residências e empresas. Agende online com praticidade e segurança." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta property="og:title" content="LimpezaPro - Limpeza Profissional" />
      <meta property="og:description" content="Serviços de limpeza profissional para residências e empresas. Agende online com praticidade e segurança." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://limpezapro.com.br" />
      <meta property="og:image" content="/logo-og.png" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://limpezapro.com.br" />
    </Head>
  );
}
