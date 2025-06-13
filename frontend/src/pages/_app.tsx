
import "../styles/globals.css";
import { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  // Only show navbar on normal pages, not on error or special pages if needed
  return (
    <>
      {/* <CyberpunkNavbar /> */}
      <Component {...pageProps} />
    </>
  );
}
