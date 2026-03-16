import { ImageResponse } from 'next/og';
import { Sparkles } from 'lucide-react';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = parseInt(searchParams.get('size') || '512', 10);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ef4444',
          borderRadius: '8px',
          color:'white',
          boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size * 0.8}
          height={size * 0.8}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-sparkles text-white w-4 h-4"
          aria-hidden="true"
        >
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4" />
          <path d="M22 4h-4" />
          <circle cx={4} cy={20} r={2} />
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    }
  );
}
