// tokens/button.ts
import { radius } from '../primitives/radius';
import { spacing } from '../primitives/spacing';
import { semantic } from '../semantics/semantic';

export const button = {
  root: {
    paddingX: spacing[14],
    paddingY: spacing[8],
    borderRadius: radius.xl,
    transitionDuration: '0.4s',
    sm: {
      paddingX: spacing[6],
      paddingY: spacing[6],
  }},
  colorScheme: {
    light: {
      root: {
        primary: {
          background: `linear-gradient(120deg, #35ABC9, #0E6378)`,
          hoverBackground: `linear-gradient(90deg, ${semantic.primary[600]} 0%, ${semantic.primary[800]} 100%)`,
          activeBackground: `linear-gradient(90deg, ${semantic.primary[500]} 0%, ${semantic.primary[800]} 100%)`,
          hoverBorderColor : 'transparent',
          color: semantic.colorScheme.light.surface[0],
          borderColor:'transparent'
        },
        secondary: {
          background: '{surface.50}',
          borderColor: semantic.colorScheme.light.surface[300],
          color: semantic.colorScheme.light.surface[950],
          hoverBackground: semantic.colorScheme.light.surface[100],
          hoverBorderColor: semantic.colorScheme.light.surface[400],
          hoverColor: semantic.colorScheme.light.surface[800],
          activeBackground: semantic.colorScheme.light.surface[200],
          activeBorderColor: semantic.colorScheme.light.surface[500],
          activeColor: semantic.colorScheme.light.surface[900],
        },
        danger: {
          background: 'transparent',
          borderColor: semantic.danger[600],
          hoverBackground: semantic.danger[600],
          activeBackground: semantic.danger[700],
          color: semantic.colorScheme.light.surface[950],
        },
      },
    },
    dark: {
      root: {
        primary: {
          background: `linear-gradient(90deg, ${semantic.primary[600]} 0%, ${semantic.primary[900]} 100%)`,
          hoverBackground: `linear-gradient(90deg, ${semantic.primary[500]} 0%, ${semantic.primary[800]} 100%)`,
          activeBackground: `linear-gradient(90deg, ${semantic.primary[700]} 0%, ${semantic.primary[950]} 100%)`,
          color: semantic.colorScheme.dark.surface[950],
        },
        secondary: {
          background: 'transparent',
          borderColor: semantic.colorScheme.dark.surface[300],
          color: semantic.colorScheme.dark.surface[950],
          hoverBackground: semantic.colorScheme.dark.surface[100],
          hoverBorderColor: semantic.colorScheme.dark.surface[400],
          hoverColor: semantic.colorScheme.dark.surface[800],
          activeBackground: semantic.colorScheme.dark.surface[200],
          activeBorderColor: semantic.colorScheme.dark.surface[500],
          activeColor: semantic.colorScheme.dark.surface[900],
        },
        danger: {
          background: 'transparent',
          borderColor: semantic.danger[500],
          hoverBackground: semantic.danger[500],
          activeBackground: semantic.danger[400],
          color: semantic.danger[500],
          hoverColor: semantic.colorScheme.dark.surface[950],
          activeColor: semantic.colorScheme.dark.surface[950],
        },
      },
    },
  },
  css: () => `
    .p-button {
      height: 40px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
};