import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CustomTooltipProps {
  title: string;
  children: React.ReactElement;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  arrow?: boolean;
  delay?: number;
  disabled?: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  title,
  children,
  placement = 'top',
  arrow = true,
  delay = 300,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewportWidth - 8) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewportHeight - 8) {
      top = viewportHeight - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    
    const id = setTimeout(() => {
      setIsVisible(true);
      setTimeoutId(null);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const handleMouseMove = () => {
    if (isVisible) {
      updatePosition();
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, placement]);

  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  const getArrowStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
    };

    switch (placement) {
      case 'top':
        return {
          ...baseStyle,
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #333',
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: '6px solid #333',
        };
      case 'left':
        return {
          ...baseStyle,
          right: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: '6px solid #333',
        };
      case 'right':
        return {
          ...baseStyle,
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '6px solid #333',
        };
      default:
        return baseStyle;
    }
  };

  const tooltipElement = isVisible ? (
    <div
      ref={tooltipRef}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 9999,
        backgroundColor: '#333',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '200px',
        wordWrap: 'break-word',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
      }}
    >
      {title}
      {arrow && <div style={getArrowStyle()} />}
    </div>
  ) : null;

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseMove: handleMouseMove,
      })}
      {tooltipElement && createPortal(tooltipElement, document.body)}
    </>
  );
};

export default CustomTooltip;
