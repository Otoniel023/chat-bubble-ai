import React, { useState } from 'react';

interface ImageCarouselProps {
    images: string[];
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
    const next = () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));

    if (images.length === 0) return null;

    return (
        <div style={{ position: 'relative', width: '280px', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)' }}>
            <img
                src={images[current]}
                alt={`Imagen ${current + 1} de ${images.length}`}
                style={{ width: '100%', height: '200px', display: 'block', objectFit: 'cover' }}
            />

            {images.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        aria-label="Imagen anterior"
                        style={{
                            position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                            width: '2rem', height: '2rem', cursor: 'pointer', fontSize: '1.25rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        ‹
                    </button>

                    <button
                        onClick={next}
                        aria-label="Imagen siguiente"
                        style={{
                            position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%',
                            width: '2rem', height: '2rem', cursor: 'pointer', fontSize: '1.25rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        ›
                    </button>

                    <div style={{ position: 'absolute', bottom: '0.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                aria-label={`Ir a imagen ${i + 1}`}
                                style={{
                                    width: i === current ? '1.25rem' : '0.5rem',
                                    height: '0.5rem',
                                    borderRadius: '9999px',
                                    background: i === current ? 'white' : 'rgba(255,255,255,0.5)',
                                    border: 'none', cursor: 'pointer', padding: 0,
                                    transition: 'all 0.2s ease',
                                }}
                            />
                        ))}
                    </div>
                </>
            )}

            <div style={{
                position: 'absolute', top: '0.5rem', right: '0.5rem',
                background: 'rgba(0,0,0,0.5)', color: 'white',
                fontSize: '0.625rem', fontWeight: 600,
                padding: '0.125rem 0.375rem', borderRadius: '9999px',
            }}>
                {current + 1}/{images.length}
            </div>
        </div>
    );
};
