import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "skeleton-glow-light": {
          "0%": {
            background: "rgba(255, 255, 255, 0.05)",
            transform: "translateX(-100%)",
          },
          "50%": {
            background: "rgba(255, 255, 255, 0.2)",
            transform: "translateX(0)",
          },
          "100%": {
            background: "rgba(255, 255, 255, 0.05)",
            transform: "translateX(100%)",
          }
        },
        "skeleton-glow-dark": {
          "0%": {
            background: "rgba(255, 255, 255, 0.03)",
            transform: "translateX(-100%)",
          },
          "50%": {
            background: "rgba(255, 255, 255, 0.1)",
            transform: "translateX(0)",
          },
          "100%": {
            background: "rgba(255, 255, 255, 0.03)",
            transform: "translateX(100%)",
          }
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
        "shimmer-horizontal": {
          "0%": {
            backgroundPosition: "-200% 50%",
          },
          "100%": {
            backgroundPosition: "200% 50%",
          },
        },
        "pulse-scale": {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.05)",
          },
        },
        "pulse-slow": {
          "0%, 100%": {
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.7 * var(--mood-intensity))",
          },
          "50%": {
            boxShadow: "0 0 30px var(--mood-glow)",
            opacity: "calc(1 * var(--mood-intensity))",
          }
        },
        "pulse-gentle": {
          "0%, 100%": {
            boxShadow: "0 0 10px var(--mood-glow)",
            opacity: "calc(0.5 * var(--mood-intensity))",
          },
          "50%": {
            boxShadow: "0 0 20px var(--mood-glow)",
            opacity: "calc(0.8 * var(--mood-intensity))",
          }
        },
        "pulse-irregular": {
          "0%": {
            boxShadow: "0 0 10px var(--mood-glow)",
            opacity: "calc(0.6 * var(--mood-intensity))",
          },
          "25%": {
            boxShadow: "0 0 25px var(--mood-glow)",
            opacity: "calc(0.9 * var(--mood-intensity))",
          },
          "50%": {
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.7 * var(--mood-intensity))",
          },
          "75%": {
            boxShadow: "0 0 30px var(--mood-glow)",
            opacity: "calc(1 * var(--mood-intensity))",
          },
          "100%": {
            boxShadow: "0 0 10px var(--mood-glow)",
            opacity: "calc(0.6 * var(--mood-intensity))",
          }
        },
        "flicker": {
          "0%, 100%": {
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.7 * var(--mood-intensity))",
          },
          "10%": {
            boxShadow: "0 0 5px var(--mood-glow)",
            opacity: "calc(0.4 * var(--mood-intensity))",
          },
          "20%": {
            boxShadow: "0 0 25px var(--mood-glow)",
            opacity: "calc(0.9 * var(--mood-intensity))",
          },
          "30%": {
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.7 * var(--mood-intensity))",
          },
          "40%": {
            boxShadow: "0 0 20px var(--mood-glow)",
            opacity: "calc(0.8 * var(--mood-intensity))",
          },
          "50%": {
            boxShadow: "0 0 10px var(--mood-glow)",
            opacity: "calc(0.5 * var(--mood-intensity))",
          },
          "60%": {
            boxShadow: "0 0 30px var(--mood-glow)",
            opacity: "calc(1 * var(--mood-intensity))",
          },
          "70%": {
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.7 * var(--mood-intensity))",
          },
          "80%": {
            boxShadow: "0 0 5px var(--mood-glow)",
            opacity: "calc(0.3 * var(--mood-intensity))",
          },
          "90%": {
            boxShadow: "0 0 20px var(--mood-glow)",
            opacity: "calc(0.8 * var(--mood-intensity))",
          }
        },
        "flicker-intense": {
          "0%, 100%": {
            boxShadow: "0 0 30px var(--mood-glow)",
            opacity: "calc(1 * var(--mood-intensity))",
          },
          "8%": {
            boxShadow: "0 0 5px var(--mood-glow)",
            opacity: "calc(0.2 * var(--mood-intensity))",
          },
          "10%": {
            boxShadow: "0 0 35px var(--mood-glow)",
            opacity: "calc(1 * var(--mood-intensity))",
          },
          "12%": {
            boxShadow: "0 0 5px var(--mood-glow)",
            opacity: "calc(0.2 * var(--mood-intensity))",
          },
          "20%": {
            boxShadow: "0 0 25px var(--mood-glow)",
            opacity: "calc(0.9 * var(--mood-intensity))",
          },
          "35%": {
            boxShadow: "0 0 40px var(--mood-glow)",
            opacity: "calc(1 * var(--mood-intensity))",
          },
          "38%": {
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.6 * var(--mood-intensity))",
          },
          "40%": {
            boxShadow: "0 0 25px var(--mood-glow)",
            opacity: "calc(0.9 * var(--mood-intensity))",
          },
          "55%": {
            boxShadow: "0 0 30px var(--mood-glow)",
            opacity: "calc(1 * var(--mood-intensity))",
          },
          "60%": {
            boxShadow: "0 0 5px var(--mood-glow)",
            opacity: "calc(0.2 * var(--mood-intensity))",
          },
          "65%": {
            boxShadow: "0 0 25px var(--mood-glow)",
            opacity: "calc(0.9 * var(--mood-intensity))",
          },
          "75%": {
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.6 * var(--mood-intensity))",
          },
          "85%": {
            boxShadow: "0 0 35px var(--mood-glow)",
            opacity: "calc(1 * var(--mood-intensity))",
          },
          "95%": {
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.6 * var(--mood-intensity))",
          }
        },
        "fade-in-out": {
          "0%, 100%": {
            boxShadow: "0 0 20px var(--mood-glow)",
            opacity: "calc(0.6 * var(--mood-intensity))",
          },
          "50%": {
            boxShadow: "0 0 30px var(--mood-glow)",
            opacity: "calc(1 * var(--mood-intensity))",
          }
        },
        "scanning": {
          "0%": {
            boxShadow: "0 0 20px var(--mood-glow)",
            backgroundPosition: "0% 0",
            backgroundImage: "linear-gradient(90deg, transparent 0%, var(--mood-secondary) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            opacity: "calc(0.8 * var(--mood-intensity))",
          },
          "100%": {
            boxShadow: "0 0 40px var(--mood-glow)",
            backgroundPosition: "200% 0",
            backgroundImage: "linear-gradient(90deg, transparent 0%, var(--mood-secondary) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            opacity: "calc(1 * var(--mood-intensity))",
          }
        },
        "sparkle": {
          "0%": {
            boxShadow: "0 0 20px var(--mood-glow), 0 0 30px var(--mood-secondary), inset 0 0 10px var(--mood-secondary)",
            opacity: "calc(0.7 * var(--mood-intensity))",
          },
          "25%": {
            boxShadow: "0 0 30px var(--mood-glow), 0 0 10px var(--mood-secondary), inset 0 0 5px var(--mood-secondary)",
            opacity: "calc(0.5 * var(--mood-intensity))",
          },
          "50%": {
            boxShadow: "0 0 40px var(--mood-glow), 0 0 20px var(--mood-secondary), inset 0 0 15px var(--mood-secondary)",
            opacity: "calc(1 * var(--mood-intensity))",
          },
          "75%": {
            boxShadow: "0 0 25px var(--mood-glow), 0 0 25px var(--mood-secondary), inset 0 0 10px var(--mood-secondary)",
            opacity: "calc(0.8 * var(--mood-intensity))",
          },
          "100%": {
            boxShadow: "0 0 20px var(--mood-glow), 0 0 30px var(--mood-secondary), inset 0 0 10px var(--mood-secondary)",
            opacity: "calc(0.7 * var(--mood-intensity))",
          }
        },
        "bounce-subtle": {
          "0%, 100%": {
            transform: "translateY(0)",
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.7 * var(--mood-intensity))",
          },
          "50%": {
            transform: "translateY(-5px)",
            boxShadow: "0 0 25px var(--mood-glow)",
            opacity: "calc(0.9 * var(--mood-intensity))",
          }
        },
        "wobble": {
          "0%, 100%": {
            transform: "rotate(-1deg)",
            boxShadow: "0 0 15px var(--mood-glow)",
            opacity: "calc(0.7 * var(--mood-intensity))",
          },
          "50%": {
            transform: "rotate(1deg)",
            boxShadow: "0 0 25px var(--mood-glow)",
            opacity: "calc(0.9 * var(--mood-intensity))",
          }
        },
        "pop-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "skeleton-glow-light": "skeleton-glow-light 2s ease-in-out infinite",
        "skeleton-glow-dark": "skeleton-glow-dark 2s ease-in-out infinite",
        "shimmer": "shimmer 2.5s ease-in-out infinite",
        "shimmer-horizontal": "shimmer-horizontal 3s ease-in-out infinite",
        "pulse-scale": "pulse-scale 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 4s ease-in-out infinite",
        "pulse-gentle": "pulse-gentle 3s ease-in-out infinite",
        "pulse-irregular": "pulse-irregular 6s ease-in-out infinite",
        "flicker": "flicker 5s ease-in-out infinite",
        "flicker-intense": "flicker-intense 4s ease-in-out infinite",
        "fade-in-out": "fade-in-out 3s ease-in-out infinite",
        "scanning": "scanning 4s linear infinite",
        "sparkle": "sparkle 5s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "wobble": "wobble 2.5s ease-in-out infinite",
        "pop-in": "pop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
