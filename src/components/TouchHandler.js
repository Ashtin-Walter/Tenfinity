import React, { useEffect, useRef, memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Component to handle touch interactions optimized for iPhone 11
 */
const TouchHandler = memo(({
  children,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  preventScroll = true,
  touchOffset = 80, // Default offset optimized for iPhone 11
  enabled = true
}) => {
  const containerRef = useRef(null);
  const touchStartPosRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  
  // Handle touch start
  useEffect(() => {
    if (!enabled) return;
    
    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartPosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          timestamp: Date.now()
        };
        
        if (onTouchStart) {
          onTouchStart(e);
        }
      }
    };
    
    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [enabled, onTouchStart, preventScroll]);
  
  // Handle touch move
  useEffect(() => {
    if (!enabled) return;
    
    const handleTouchMove = (e) => {
      if (preventScroll) {
        e.preventDefault();
      }
      
      if (onTouchMove) {
        // Apply iPhone 11 specific touch offset
        const adjustedEvent = {
          ...e,
          adjustedY: e.touches[0] ? e.touches[0].clientY - touchOffset : 0
        };
        onTouchMove(adjustedEvent);
      }
    };
    
    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
      return () => {
        element.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [enabled, onTouchMove, preventScroll, touchOffset]);
  
  // Handle touch end
  useEffect(() => {
    if (!enabled) return;
    
    const handleTouchEnd = (e) => {
      if (onTouchEnd) {
        // Calculate touch duration for better interaction
        const touchDuration = touchStartPosRef.current 
          ? Date.now() - touchStartPosRef.current.timestamp 
          : 0;
        
        const adjustedEvent = {
          ...e,
          touchDuration,
          wasShortTouch: touchDuration < 300
        };
        
        onTouchEnd(adjustedEvent);
      }
      
      touchStartPosRef.current = null;
    };
    
    const element = containerRef.current;
    if (element) {
      element.addEventListener('touchend', handleTouchEnd);
      element.addEventListener('touchcancel', handleTouchEnd);
      return () => {
        element.removeEventListener('touchend', handleTouchEnd);
        element.removeEventListener('touchcancel', handleTouchEnd);
      };
    }
  }, [enabled, onTouchEnd]);
  
  return (
    <div 
      ref={containerRef} 
      className="touch-handler"
      style={{ 
        touchAction: preventScroll ? 'none' : 'auto',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        width: '100%',
        height: '100%'
      }}
    >
      {children}
    </div>
  );
});

TouchHandler.propTypes = {
  children: PropTypes.node.isRequired,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func,
  preventScroll: PropTypes.bool,
  touchOffset: PropTypes.number,
  enabled: PropTypes.bool
};

export default TouchHandler;