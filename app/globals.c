@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  /* Page background set to gradient in body, variable kept as fallback/reference */
  --background: oklch(97.913% 0.00011 271.152 / 0.904);
  --foreground: oklch(0.15 0.02 240);
  
  /* Cards and Sidebars set to white with slight transparency */
  --card: oklch(1 0 0 / 0.85);
  --card-foreground: oklch(0.15 0.02 240);
  --popover: oklch(1 0 0 / 0.9);
  --popover-foreground: oklch(0.15 0.02 240);
  --sidebar: oklch(1 0 0 / 0.9);
  --sidebar-foreground: oklch(0.15 0.02 240);
  
  --primary: #2f85ad;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.92 0.04 60);
  --secondary-foreground: oklch(0.2 0.03 240);
  --muted: oklch(0.94 0.01 0);
  --muted-foreground: #6b7280;
  --accent: oklch(50.301% 0.14173 149.076);
  --accent-foreground: oklch(1 0 0);
  --destructive: #33CC33;
  --destructive-foreground: #ffffff;
  --border: oklch(0.92 0.01 0);
  --input: oklch(0.96 0.01 0);
  --ring: #0096DC;
  --chart-1: #0096DC;
  --chart-2: oklch(0.65 0.2 30);
  --chart-3: oklch(0.45 0.1 180);
  --chart-4: oklch(0.55 0.12 150);
  --chart-5: oklch(0.75 0.08 90);
  --radius: 0.625rem;
  --sidebar-primary: #0096DC;
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.92 0.04 60);
  --sidebar-accent-foreground: oklch(0.2 0.03 240);
  --sidebar-border: oklch(0.92 0.01 0);
  --sidebar-ring: #0096DC;
}

.dark {
  --background: oklch(11.871% 0.0116 240.792 / 0.26);
  --foreground: oklch(0.95 0.01 70);
  --card: oklch(0.18 0.01 240 / 0.85);
  --card-foreground: oklch(0.95 0.01 70);
  --popover: oklch(0.18 0.01 240 / 0.9);
  --popover-foreground: oklch(0.95 0.01 70);
  --primary: #0096DC;
  --primary-foreground: oklch(0.12 0.01 240);
  --secondary: oklch(0.25 0.02 240);
  --secondary-foreground: oklch(0.95 0.01 70);
  --muted: oklch(0.25 0.01 240);
  --muted-foreground: #6b7280;
  --accent: oklch(0.75 0.2 30);
  --accent-foreground: oklch(0.12 0.01 240);
  --destructive: #33CC33;
  --destructive-foreground: #ffffff;
  --border: oklch(0.25 0.01 240);
  --input: oklch(0.22 0.01 240);
  --ring: #0096DC;
  --chart-1: #0096DC;
  --chart-2: oklch(0.75 0.2 30);
  --chart-3: oklch(0.65 0.15 180);
  --chart-4: oklch(0.7 0.15 150);
  --chart-5: oklch(0.65 0.12 90);
  --sidebar: oklch(0.15 0.01 240 / 0.9);
  --sidebar-foreground: oklch(0.95 0.01 70);
  --sidebar-primary: #0096DC;
  --sidebar-primary-foreground: oklch(0.12 0.01 240);
  --sidebar-accent: oklch(0.25 0.02 240);
  --sidebar-accent-foreground: oklch(0.95 0.01 70);
  --sidebar-border: oklch(0.25 0.01 240);
  --sidebar-ring: #0096DC;
}

@theme inline {
  --font-sans: "Geist", "Geist Fallback";
  --font-mono: "Geist Mono", "Geist Mono Fallback";
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}


 html, body {
  height: 100%;
  min-height: 100%;
  margin: 0;
  padding: 0;
  background: linear-gradient(
    135deg,
    
    /* faint soft orange */
    rgba(24, 165, 24, 0.123) 0%,
    rgba(244, 251, 255, 0.267) 15%,

    /* faint grey */
    rgba(230, 230, 230, 0.151) 45%,
    rgba(229, 235, 183, 0.26) 60%,

    /* faint golden green */
    rgba(247, 243, 189, 0.2) 85%,
    rgba(195, 238, 160, 0.178) 100%
  ) fixed !important;


@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply text-foreground;
    /* Diagonal gradient: Orange -> Golden Green -> Light Blue */
    background: linear-gradient(135deg, #fff5e8 0%, #ffe8d5 25%, #f0f4e8 50%, #e8f4f8 100%) !important;
    min-height: 100vh;
  }
}

@layer utilities {

  /* Override all hover background utilities with custom color */
  [class*="hover:bg-"]:hover,
  .hover\:bg-primary:hover,
  .hover\:bg-secondary:hover,
  .hover\:bg-accent:hover,
  .hover\:bg-muted:hover,
  .hover\:bg-destructive:hover,
  .hover\:bg-background:hover,
  .hover\:bg-card:hover,
  .hover\:bg-popover:hover,
  .hover\:bg-input:hover {
    background-color: #0088c6b0 !important;
  }

  /* Also override opacity variants */
  [class*="hover:bg-primary/"]:hover,
  [class*="hover:bg-secondary/"]:hover,
  [class*="hover:bg-accent/"]:hover,
  [class*="hover:bg-muted/"]:hover,
  [class*="hover:bg-destructive/"]:hover {
    background-color: #0088c7b0 !important;
  }

  .scrollbar-light::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }

  .scrollbar-light::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-light::-webkit-scrollbar-thumb {
    background-color: oklch(0.9 0 0);
    border-radius: 20px;
  }

  .dark .scrollbar-light::-webkit-scrollbar-thumb {
    background-color: oklch(0.3 0 0);
  }

  .scrollbar-light::-webkit-scrollbar-thumb:hover {
    background-color: oklch(0.8 0 0);
  }

  .dark .scrollbar-light::-webkit-scrollbar-thumb:hover {
    background-color: oklch(0.4 0 0);
  }

  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .animate-marquee {
    animation: marquee 40s linear infinite;
    width: max-content;
  }
}
