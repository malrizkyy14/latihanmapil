import "./globals.css";

export const metadata = {
  title: "Daftar Siswa",
  description: "CRUD daftar siswa dengan Next.js dan MySQL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
