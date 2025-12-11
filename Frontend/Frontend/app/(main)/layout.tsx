'use client';

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthInitializer from "@/lib/components/AuthInitializer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthInitializer />
      <Header />
      {children}
      <Footer />
    </>
  );
}

