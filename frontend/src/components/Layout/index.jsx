/* automatic JSX runtime */
import Header from './Header';
import Footer from './Footer';

export { default as Header } from './Header';
export { default as Footer } from './Footer';

export const MainLayout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showHeader && <Header />}
      <main className="flex-grow">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};
