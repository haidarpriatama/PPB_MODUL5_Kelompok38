function About() {
  const teamMembers = [
    { nama: 'Haidar Rafi Apta Priatama', nim: '21120124140107' },
    { nama: 'Shofwan Thufail Akhmad', nim: '21120124130066' },
    { nama: 'Josh Peter Sirait', nim: '21120124140155' },
    { nama: 'Chico Diar Ramadhan', nim: '21120124140150' },
  ]

  return (
    <div className="page">
      <h1 className="display">A one-room armory.</h1>
      <p className="lede">
        Bore &amp; Barrel sells a short, honest list of firearms. Each piece is priced
        from the bench — no markup theatre, no filler.
      </p>

      <section style={{ marginTop: '2.5rem', borderTop: '1px solid var(--line)', paddingTop: '1.5rem' }}>
        <h2 className="display" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Praktikum Pemrograman Perangkat Bergerak
        </h2>
        <p style={{ color: 'var(--brass)', fontWeight: 600, marginBottom: '1.25rem' }}>
          Modul 5 — Progressive Web App (PWA) II &bull; Kelompok 38
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {teamMembers.map((m) => (
            <div
              key={m.nim}
              style={{
                padding: '1rem 1.25rem',
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--ink)' }}>{m.nama}</div>
              <div style={{ color: 'var(--steel)', fontSize: '0.85rem', marginTop: '0.25rem' }}>NIM: {m.nim}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default About
