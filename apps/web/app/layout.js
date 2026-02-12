import './globals.css';

export const metadata = {
  title: 'Full-Stack Projects',
  description: 'Your revenue intelligence command center.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
