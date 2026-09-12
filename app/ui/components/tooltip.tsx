'use client';

import { useEffect } from 'react';

export default function TooltipInitializer() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[title]');

    elements.forEach((element) => {
      const title = element.getAttribute('title');

      if (!title) return;

      // Remove native browser tooltip
      element.removeAttribute('title');

      const tooltip = document.createElement('span');
      tooltip.textContent = title;

      tooltip.className =
        'pointer-events-none absolute left-1/2 top-full z-50 mt-1 hidden w-24 max-w-[500px] -translate-x-1/2 break-words rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-md';

      element.style.position = 'relative';
      element.appendChild(tooltip);

      element.addEventListener('mouseenter', () => {
        tooltip.classList.remove('hidden');
      });

      element.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
      });
    });
  }, []);

  return null;
}