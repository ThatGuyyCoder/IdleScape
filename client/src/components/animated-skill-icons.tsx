interface AnimatedIconProps {
  className?: string;
}

// Animated Mining Icon - Pickaxe hitting rock with sparks
export function AnimatedMiningIcon({ className = "w-6 h-6" }: AnimatedIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Rock */}
      <path 
        d="M6 18 L18 18 L16 12 L8 12 Z" 
        fill="#6B7280" 
        stroke="#4B5563" 
        strokeWidth="1"
      />
      
      {/* Pickaxe handle */}
      <path 
        d="M10 2 L12 2 L13 10 L11 10 Z" 
        fill="#8B4513" 
        stroke="#654321" 
        strokeWidth="0.5"
      />
      
      {/* Pickaxe head */}
      <path 
        d="M8 8 L16 8 L14 10 L10 10 Z" 
        fill="#C0C0C0" 
        stroke="#A0A0A0" 
        strokeWidth="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 12 9; -15 12 9; 0 12 9"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Sparks */}
      <circle r="1" fill="#FFD700">
        <animate attributeName="cx" values="14; 16; 14" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="12; 10; 12" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0; 1; 0" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle r="0.8" fill="#FF6B35">
        <animate attributeName="cx" values="15; 17; 15" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
        <animate attributeName="cy" values="11; 9; 11" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
        <animate attributeName="opacity" values="0; 1; 0" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
      </circle>
    </svg>
  );
}

// Animated Fishing Icon - Fish swimming back and forth
export function AnimatedFishingIcon({ className = "w-6 h-6" }: AnimatedIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fishing line */}
      <path 
        d="M12 2 L12 18" 
        stroke="currentColor" 
        strokeWidth="1" 
        strokeLinecap="round"
      />
      
      {/* Hook */}
      <path 
        d="M12 18 C 13 18, 13 19, 12 19 C 11 19, 11 18, 12 18" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none"
      />
      
      {/* Fish body */}
      <ellipse 
        cx="12" 
        cy="15" 
        rx="3" 
        ry="1.5" 
        fill="#4FC3F7" 
        stroke="#2196F3" 
        strokeWidth="0.5"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 2 0; 0 0; -2 0; 0 0"
          dur="3s"
          repeatCount="indefinite"
        />
      </ellipse>
      
      {/* Fish tail */}
      <path 
        d="M15 15 L18 13 L18 17 Z" 
        fill="#2196F3"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 2 0; 0 0; -2 0; 0 0"
          dur="3s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.7; 1; 0.7"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Bubbles */}
      <circle r="0.5" fill="#87CEEB" opacity="0.6">
        <animate attributeName="cx" values="10; 10; 10" dur="2s" repeatCount="indefinite" />
        <animate attributeName="cy" values="16; 8; 16" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0; 0.8; 0" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle r="0.3" fill="#87CEEB" opacity="0.6">
        <animate attributeName="cx" values="14; 14; 14" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="cy" values="16; 8; 16" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0; 0.8; 0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
      </circle>
    </svg>
  );
}

// Animated Woodcutting Icon - Tree with falling leaves
export function AnimatedWoodcuttingIcon({ className = "w-6 h-6" }: AnimatedIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tree trunk */}
      <rect 
        x="11" 
        y="14" 
        width="2" 
        height="8" 
        fill="#8B4513" 
        stroke="#654321" 
        strokeWidth="0.5"
      />
      
      {/* Tree crown */}
      <circle 
        cx="12" 
        cy="10" 
        r="6" 
        fill="#228B22" 
        stroke="#006400" 
        strokeWidth="0.5"
        opacity="0.9"
      />
      
      {/* Falling leaves */}
      <path 
        d="M8 8 C 8 8, 10 6, 12 8 C 12 8, 10 10, 8 8" 
        fill="#FF6B35"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; -2 8; -4 16"
          dur="3s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 10 8; 180 10 8; 360 10 8"
          dur="3s"
          repeatCount="indefinite"
          additive="sum"
        />
        <animate
          attributeName="opacity"
          values="1; 1; 0"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      
      <path 
        d="M16 9 C 16 9, 18 7, 20 9 C 20 9, 18 11, 16 9" 
        fill="#DAA520"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 1 10; 2 20"
          dur="4s"
          repeatCount="indefinite"
          begin="1s"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 18 9; 180 18 9; 360 18 9"
          dur="4s"
          repeatCount="indefinite"
          begin="1s"
          additive="sum"
        />
        <animate
          attributeName="opacity"
          values="1; 1; 0"
          dur="4s"
          repeatCount="indefinite"
          begin="1s"
        />
      </path>
      
      <path 
        d="M14 6 C 14 6, 16 4, 18 6 C 18 6, 16 8, 14 6" 
        fill="#CD853F"
      >
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; -1 9; -2 18"
          dur="3.5s"
          repeatCount="indefinite"
          begin="2s"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 16 6; 180 16 6; 360 16 6"
          dur="3.5s"
          repeatCount="indefinite"
          begin="2s"
          additive="sum"
        />
        <animate
          attributeName="opacity"
          values="1; 1; 0"
          dur="3.5s"
          repeatCount="indefinite"
          begin="2s"
        />
      </path>
    </svg>
  );
}

// Animated Cooking Icon - Flickering flame
export function AnimatedCookingIcon({ className = "w-6 h-6" }: AnimatedIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base of flame */}
      <ellipse 
        cx="12" 
        cy="20" 
        rx="4" 
        ry="1" 
        fill="#FF4500" 
        opacity="0.8"
      />
      
      {/* Main flame */}
      <path 
        d="M8 20 C 8 20, 8 12, 12 10 C 16 12, 16 20, 16 20 C 16 18, 14 16, 12 16 C 10 16, 8 18, 8 20"
        fill="#FF6B35"
      >
        <animate
          attributeName="d"
          values="M8 20 C 8 20, 8 12, 12 10 C 16 12, 16 20, 16 20 C 16 18, 14 16, 12 16 C 10 16, 8 18, 8 20;
                  M8 20 C 8 20, 7 11, 12 9 C 17 11, 16 20, 16 20 C 16 17, 15 15, 12 15 C 9 15, 8 17, 8 20;
                  M8 20 C 8 20, 9 13, 12 11 C 15 13, 16 20, 16 20 C 16 19, 13 17, 12 17 C 11 17, 8 19, 8 20;
                  M8 20 C 8 20, 8 12, 12 10 C 16 12, 16 20, 16 20 C 16 18, 14 16, 12 16 C 10 16, 8 18, 8 20"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Inner flame */}
      <path 
        d="M10 18 C 10 18, 10 14, 12 13 C 14 14, 14 18, 14 18 C 14 17, 13 16, 12 16 C 11 16, 10 17, 10 18"
        fill="#FFD700"
      >
        <animate
          attributeName="d"
          values="M10 18 C 10 18, 10 14, 12 13 C 14 14, 14 18, 14 18 C 14 17, 13 16, 12 16 C 11 16, 10 17, 10 18;
                  M10 18 C 10 18, 9 13, 12 12 C 15 13, 14 18, 14 18 C 14 16, 14 15, 12 15 C 10 15, 10 16, 10 18;
                  M10 18 C 10 18, 11 15, 12 14 C 13 15, 14 18, 14 18 C 14 18, 12 17, 12 17 C 12 17, 10 18, 10 18;
                  M10 18 C 10 18, 10 14, 12 13 C 14 14, 14 18, 14 18 C 14 17, 13 16, 12 16 C 11 16, 10 17, 10 18"
          dur="1.2s"
          repeatCount="indefinite"
          begin="0.3s"
        />
      </path>
      
      {/* Core flame */}
      <path 
        d="M11 17 C 11 17, 11 15, 12 15 C 13 15, 13 17, 13 17 C 13 16, 12 16, 12 16 C 12 16, 11 16, 11 17"
        fill="#FFFFFF"
        opacity="0.8"
      >
        <animate
          attributeName="opacity"
          values="0.8; 0.4; 1; 0.6; 0.8"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Heat waves */}
      <path 
        d="M6 12 C 8 10, 8 8, 6 6" 
        stroke="#FF6B35" 
        strokeWidth="1" 
        fill="none" 
        opacity="0.3"
      >
        <animate
          attributeName="opacity"
          values="0; 0.5; 0"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      <path 
        d="M18 12 C 16 10, 16 8, 18 6" 
        stroke="#FF6B35" 
        strokeWidth="1" 
        fill="none" 
        opacity="0.3"
      >
        <animate
          attributeName="opacity"
          values="0; 0.5; 0"
          dur="2s"
          repeatCount="indefinite"
          begin="1s"
        />
      </path>
    </svg>
  );
}