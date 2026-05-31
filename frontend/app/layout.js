import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'TradeLink — Service Request Board',
  description: 'Post and browse home service requests',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <Navbar />
        <main style={{maxWidth:'1360px', margin:'0 auto', padding:'0.75rem 2.5rem 5rem'}}>
          {children}
        </main>
      </body>
    </html>
  );
}