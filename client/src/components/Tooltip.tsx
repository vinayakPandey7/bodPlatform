import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  show: boolean;
  anchorEl: HTMLElement | null;
  position?: 'left' | 'right';
}

export default function Tooltip({ text, show, anchorEl, position = 'left' }: TooltipProps) {
  const [tooltipNode] = useState(() => document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(tooltipNode);
    return () => {
      document.body.removeChild(tooltipNode);
    };
  }, [tooltipNode]);

  useEffect(() => {
    if (show && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      tooltipNode.style.position = 'absolute';
      tooltipNode.style.zIndex = '9999';
      tooltipNode.style.top = `${rect.bottom + scrollTop + 4}px`; // 4px gap

      if (position === 'left') {
        tooltipNode.style.left = `${rect.left + scrollLeft}px`;
      } else {
        tooltipNode.style.right = `${window.innerWidth - (rect.right + scrollLeft)}px`;
      }
    }
  }, [show, anchorEl, tooltipNode, position]);

  if (!show || !anchorEl) return null;

  return createPortal(
    <div className="relative inline-block">
      <div 
        className={`absolute -top-1 ${position === 'left' ? 'left-4' : 'right-4'} w-2 h-2 bg-gray-800 transform rotate-45`}
      />
      <div className="relative px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md whitespace-nowrap">
        {text}
      </div>
    </div>,
    tooltipNode
  );
} 