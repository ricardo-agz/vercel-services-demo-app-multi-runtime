export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.03em' }}>404</h1>
        <p style={{ color: '#888', marginTop: 8 }}>This page does not exist.</p>
        <a href="/" style={{
          display: 'inline-block', marginTop: 24, padding: '10px 20px', borderRadius: 6,
          background: '#fff', color: '#000', fontWeight: 600, fontSize: 14,
        }}>Back to Home</a>
      </div>
    </div>
  );
}
