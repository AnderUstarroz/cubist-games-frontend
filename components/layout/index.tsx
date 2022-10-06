import dynamic from "next/dynamic";

const Header = dynamic(() => import("../header"));
const Footer = dynamic(() => import("../footer"));

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
