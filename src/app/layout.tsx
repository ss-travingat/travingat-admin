import { cookies } from "next/headers";
import ClientLayout from "./ClientLayout";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("admin_session") || cookieStore.has("cms_session");

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body>
        <ClientLayout hasSession={hasSession}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
