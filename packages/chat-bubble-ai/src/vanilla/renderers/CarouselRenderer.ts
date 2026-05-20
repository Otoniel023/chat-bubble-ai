/**
 * CarouselRenderer - Renders an image carousel for message content
 * Images are stored in data-carousel-images attribute for event delegation
 */

export class CarouselRenderer {
  static render(images: string[]): string {
    if (!images || images.length === 0) return '';

    const imagesJson = JSON.stringify(images).replace(/"/g, '&quot;');

    return `
      <div class="image-carousel"
        data-carousel-images="${imagesJson}"
        data-current="0"
        style="
          position: relative;
          width: 100%;
          max-width: 320px;
          user-select: none;
        "
      >
        <div style="border-radius: 0.75rem; overflow: hidden; position: relative;">
          <img
            class="carousel-img"
            src="${images[0]}"
            alt="Image 1 of ${images.length}"
            style="width: 100%; height: 200px; object-fit: cover; display: block;"
          />
          ${images.length > 1 ? `
            <button class="carousel-prev" aria-label="Previous image" style="
              position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
              width: 32px; height: 32px; border-radius: 50%;
              background: rgba(0,0,0,0.5); color: white; border: none;
              cursor: pointer; font-size: 20px;
              display: flex; align-items: center; justify-content: center; line-height: 1;
            ">&#8249;</button>
            <button class="carousel-next" aria-label="Next image" style="
              position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
              width: 32px; height: 32px; border-radius: 50%;
              background: rgba(0,0,0,0.5); color: white; border: none;
              cursor: pointer; font-size: 20px;
              display: flex; align-items: center; justify-content: center; line-height: 1;
            ">&#8250;</button>
          ` : ''}
        </div>
        ${images.length > 1 ? `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 4px 2px;">
            <div class="carousel-dots" style="display: flex; gap: 4px;">
              ${images.map((_, i) => `
                <div
                  class="carousel-dot"
                  data-dot-index="${i}"
                  style="
                    width: 6px; height: 6px; border-radius: 50%;
                    background: ${i === 0 ? 'var(--color-primary, #137fec)' : '#cbd5e1'};
                    cursor: pointer; transition: background 0.2s;
                  "
                ></div>
              `).join('')}
            </div>
            <span class="carousel-counter" style="font-size: 0.625rem; color: var(--color-text-tertiary, #94a3b8);">
              1/${images.length}
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }
}
