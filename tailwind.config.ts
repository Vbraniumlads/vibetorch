import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		fontFamily: {
			sans: ['Inter', 'sans-serif'], // Default sans = body
			serif: ['Copernicus', 'Georgia', 'serif'],
			display: ['StyreneB', 'Styrene', 'sans-serif'],
			body: ['Inter', 'sans-serif'],
			times: ['Times New Roman', 'Times', 'serif'],
			tiempos: ['Playfair Display', 'Times New Roman', 'serif'],
		},
		extend: {
			colors: {
				// Design System Colors
				cta: {
					50: 'rgb(var(--cta-50))',
					100: 'rgb(var(--cta-100))',
					200: 'rgb(var(--cta-200))',
					300: 'rgb(var(--cta-300))',
					400: 'rgb(var(--cta-400))',
					500: 'rgb(var(--cta-500))',
					600: 'rgb(var(--cta-600))',
					700: 'rgb(var(--cta-700))',
					800: 'rgb(var(--cta-800))',
					900: 'rgb(var(--cta-900))'
				},
				neu: {
					0: 'rgb(var(--neu-0))',
					500: 'rgb(var(--neu-500))',
					600: 'rgb(var(--neu-600))',
					700: 'rgb(var(--neu-700))',
					800: 'rgb(var(--neu-800))',
					900: 'rgb(var(--neu-900))',
					950: 'rgb(var(--neu-950))'
				},
				acc: {
					100: 'rgb(var(--acc-100))',
					200: 'rgb(var(--acc-200))',
					300: 'rgb(var(--acc-300))',
					400: 'rgb(var(--acc-400))',
					500: 'rgb(var(--acc-500))',
					600: 'rgb(var(--acc-600))',
					700: 'rgb(var(--acc-700))',
					800: 'rgb(var(--acc-800))',
					900: 'rgb(var(--acc-900))',
					950: 'rgb(var(--acc-950))'
				},
				brand: 'rgb(var(--brand-primary))',
				success: 'rgb(var(--success))',
				warning: 'rgb(var(--warning))',
				error: 'rgb(var(--error))',

				// Semantic mappings for shadcn compatibility
				border: 'rgb(var(--border))',
				input: 'rgb(var(--input))',
				ring: 'rgb(var(--ring))',
				background: 'rgb(var(--background))',
				foreground: 'rgb(var(--foreground))',
				primary: {
					DEFAULT: 'rgb(var(--primary))',
					foreground: 'rgb(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'rgb(var(--secondary))',
					foreground: 'rgb(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'rgb(var(--destructive))',
					foreground: 'rgb(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'rgb(var(--muted))',
					foreground: 'rgb(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'rgb(var(--accent))',
					foreground: 'rgb(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'rgb(var(--popover))',
					foreground: 'rgb(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'rgb(var(--card))',
					foreground: 'rgb(var(--card-foreground))'
				},
				'panel-left': 'rgb(var(--panel-left))',
				'panel-right': 'rgb(var(--panel-right))',
				sidebar: {
					DEFAULT: 'rgb(var(--sidebar-background))',
					foreground: 'rgb(var(--sidebar-foreground))',
					primary: 'rgb(var(--sidebar-primary))',
					'primary-foreground': 'rgb(var(--sidebar-primary-foreground))',
					accent: 'rgb(var(--sidebar-accent))',
					'accent-foreground': 'rgb(var(--sidebar-accent-foreground))',
					border: 'rgb(var(--sidebar-border))',
					ring: 'rgb(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius-lg)',
				md: 'var(--radius-md)',
				sm: 'var(--radius-sm)'
			},
			spacing: {
				xs: 'var(--spacing-xs)',
				sm: 'var(--spacing-sm)',
				md: 'var(--spacing-md)',
				lg: 'var(--spacing-lg)',
				xl: 'var(--spacing-xl)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-neon': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' 
					},
					'50%': { 
						boxShadow: '0 0 30px hsl(var(--primary) / 0.6)' 
					}
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'roll-up': {
					'0%': { 
						transform: 'scaleY(1) translateY(0)', 
						transformOrigin: 'top',
						opacity: '1'
					},
					'100%': { 
						transform: 'scaleY(0) translateY(-50%)', 
						transformOrigin: 'top',
						opacity: '0'
					}
				},
				'roll-down': {
					'0%': { 
						transform: 'scaleY(0) translateY(-50%)', 
						transformOrigin: 'top',
						opacity: '0'
					},
					'100%': { 
						transform: 'scaleY(1) translateY(0)', 
						transformOrigin: 'top',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'roll-up': 'roll-up 0.3s ease-out',
				'roll-down': 'roll-down 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
