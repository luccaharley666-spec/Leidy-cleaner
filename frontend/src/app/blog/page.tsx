"use client";
import Link from 'next/link';

const posts = [
  {
    slug: 'dicas-de-limpeza-domestica',
    title: '5 Dicas de Limpeza Doméstica para o Dia a Dia',
    excerpt: 'Descubra truques simples para manter sua casa sempre limpa e organizada.'
  },
  {
    slug: 'como-escolher-empresa-limpeza',
    title: 'Como Escolher uma Empresa de Limpeza Profissional',
    excerpt: 'Veja o que considerar na hora de contratar um serviço de limpeza.'
  }
];

export default function BlogPage() {
  const [posts, setPosts] = React.useState<any[]>([]);
  React.useEffect(() => {
    fetch('/api/v1/blog')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-4">Blog LimpezaPro</h1>
      <ul className="space-y-4">
        {posts.length === 0 && <li>Nenhum post encontrado.</li>}
        {posts.map(post => (
          <li key={post.slug} className="border-b pb-4">
            <Link href={`/blog/${post.slug}`} className="text-xl font-semibold text-blue-700 hover:underline">{post.title}</Link>
            <p className="text-gray-600">{post.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
