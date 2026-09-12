import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import LoginModal from "./components/LoginModal";

export const metadata = {
  title: "Sri Madhu Crackers | Sivakasi Fireworks Online",
  description: "Premium Sivakasi crackers - wholesale & retail. Sparklers, flower pots, garlands, rockets & more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('smc-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <CartDrawer />
          <LoginModal />
        </Providers>
      </body>
    </html>
  );
}
