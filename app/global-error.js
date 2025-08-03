// app/global-error.js
'use client'

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong!</h2>
          <p>{error?.message || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => reset()}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}