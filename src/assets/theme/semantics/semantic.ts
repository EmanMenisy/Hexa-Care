// semantics/semantic.ts
import { primitive } from '../primitives/primitive';
import { radius } from '../primitives/radius';
import { spacing } from '../primitives/spacing';
import { typography } from '../primitives/typograpy';

export const semantic = {
  disabledOpacity: '0.6',
  iconSize: typography.fontSize.labelLg,
  anchorGutter: spacing[4],
  transitionDuration: '0.2s',
  formField: {
    paddingX: spacing[10],
    paddingY: spacing[8],
    borderRadius: radius.lg,
    transitionDuration: '{transition.duration}',
  },

  list: {
    padding: spacing[10],
    gap: '2px',
    header: {
      padding: spacing[4],
    },
    option: {
      padding: spacing[8],
      borderRadius: radius.md,
    },
  },

  mask: {
    transitionDuration: '0.2s',
  },

  navigation: {
    list: {
      padding: spacing[10],
      gap: spacing[4],
    },
    item: {
      padding: spacing[10],
      borderRadius: radius.md,
      gap: spacing[4],
    },
    submenuLabel: {
      padding: spacing[10],
      fontWeight: typography.fontWeight.semibold,
    },
    submenuIcon: {
      size: typography.fontSize.labelLg,
    },
  },
  overlay: {
    select: {
      borderRadius: radius.md,
      shadow: '0 4px 6px -1px rgba(23, 22, 22, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },
    modal: {
      borderRadius: radius.lg,
      padding: spacing[20],
      shadow: '0 20px 25px -5px rgba(16, 15, 15, 0.1), 0 8px 10px -6px rgba(11, 11, 11, 0.1)',
    },
  },
  primary: {
    50: primitive.cyan[50],
    100: primitive.cyan[100],
    200: primitive.cyan[200],
    300: primitive.cyan[300],
    400: primitive.cyan[400],
    500: primitive.cyan[500],
    600: primitive.cyan[600],
    700: primitive.cyan[700],
    800: primitive.cyan[800],
    900: primitive.cyan[900],
    950: primitive.cyan[950],
  },

  danger: {
    50: primitive.red[50],
    100: primitive.red[100],
    200: primitive.red[200],
    300: primitive.red[300],
    400: primitive.red[400],
    500: primitive.red[500],
    600: primitive.red[600],
    700: primitive.red[700],
    800: primitive.red[800],
    900: primitive.red[900],
    950: primitive.red[950],
  },

  success: {
    50: primitive.green[50],
    100: primitive.green[100],
    200: primitive.green[200],
    300: primitive.green[300],
    400: primitive.green[400],
    500: primitive.green[500],
    600: primitive.green[600],
    700: primitive.green[700],
    800: primitive.green[800],
    900: primitive.green[900],
    950: primitive.green[950],
  },
  colorScheme: {
    light: {
      surface: {
        0: primitive.neutral[0],
        50: primitive.neutral[50],
        100: primitive.neutral[100],
        200: primitive.neutral[200],
        300: primitive.neutral[300],
        400: primitive.neutral[400],
        500: primitive.neutral[500],
        600: primitive.neutral[600],
        700: primitive.neutral[700],
        800: primitive.neutral[800],
        900: primitive.neutral[900],
        950: primitive.neutral[950],
      },
      text: {
        color: '{surface.900}',
        hoverColor: '{surface.700}',
        mutedColor: '{surface.500}',
        hoverMutedColor: '{surface.700}',
      },
      primary: {
        color: '#006A61',
        contrastColor: '{surface.100}',
        hoverColor: '#006A61',
        activeColor: '#006A61',
      },
      border: {
        default: '{primary.700}',
        hover: '{surface.600}',
        focus: '{primary.800}',
        disabled: '{surface.200}',
        danger: '{danger.500}',
      },
      mask: {
        background: 'rgba(0,0,0,0.4)',
      },
      highlight: {
        background: '{primary.800}',
        color: '{primary.50}',
        focusBackground: '{primary.800}',
        focusColor: '{primary.50}',
      },
      overlay: {
        select: {
          background: '{surface.50}',
          borderColor: '{surface.700}',
          color: '{text.primary}',
        },
        modal: {
          background: '{surface.100}',
          borderColor: '{surface.200}',
          color: '{text.primary}',
        },
      },
      list: {
        option: {
          color: '{text.primary}',
          focusColor: '{text.primary}',
          selectedColor: '{primary.700}',
          selectedFocusColor: '{primary.700}',
          background: 'transparent',
          focusBackground: '{surface.200}',
          selectedBackground: '{primary.200}',
          selectedFocusBackground: '{primary.300}',
        },
      },

     formField: {
        background: '{surface.100}',
        disabledBackground: '{surface.200}',
        filledBackground: '{surface.900}',
        filledHoverBackground: '{surface.100}',
        borderColor: '{surface.300}',
        hoverBorderColor: '{border.hover}',
        focusBorderColor: '{border.focus}',
        color: '#006A61',
        disabledColor: '{surface.5 00}',
        placeholderColor: '{surface.400}',
        invalidPlaceholderColor: '{danger.600}',
        invalidBorderColor:'{border.danger}',
        iconColor: '{surface.400}',
        focusRing: {
          width: spacing[2],
          style: 'solid',
          color: '#006A61',
          offset: '0px',
        },
      },
    },
    dark: {
      surface: {
        0: primitive.neutral[950],
        50: primitive.neutral[900],
        100: primitive.neutral[800],
        200: primitive.neutral[700],
        300: primitive.neutral[600],
        400: primitive.neutral[500],
        500: primitive.neutral[400],
        600: primitive.neutral[300],
        700: primitive.neutral[200],
        800: primitive.neutral[100],
        900: primitive.neutral[50],
        950: primitive.neutral[0],
      },
      text: {
        color: '{surface.950}',
        hoverColor: '{surface.200}',
        mutedColor: '{surface.400}',
        hoverMutedColor: '{surface.200}',
      },
      primary: {
        color: '{primary.400}',
        contrastColor: '{surface.900}',
        hoverColor: '{primary.800}',
        activeColor: '{primary.200}',
      },
      mask: {
        background: 'rgba(0,0,0,0.7)',
      },
      overlay: {
        select: {
          background: '{surface.50}',
          borderColor: '{surface.400}',
          color: '{text.primary}',
        },
        modal: {
          background: '{surface.50}',
          borderColor: '{surface.400}',
          color: '{text.primary}',
        },
      },
      border: {
        default: '{primary.400}',
        hover: '{surface.500}',
        focus: '{primary.500}',
        disabled: '{surface.800}',
        danger: '{danger.500}',
      },

      highlight: {
        background: '{primary.900}',
        color: '{primary.100}',
        focusBackground: '{primary.800}',
        focusColor: '{primary.50}',
      },
      list: {
        option: {
          color: '{surface.950}',
          focusColor: '{text.primary}',
          selectedColor: '{primary.300}',
          selectedFocusColor: '{primary.300}',
          background: 'transparent',
          focusBackground: '{primary.600}',
          selectedBackground: '{primary.900}',
          selectedFocusBackground: '{primary.800}',
        },
      },
      formField: {
        background: '{surface.50}',
        disabledBackground: '{surface.100}',
        filledBackground: '{surface.100}',
        filledHoverBackground: '{surface.200}',
        borderColor: '{border.default}',
        hoverBorderColor: '{border.hover}',
        focusBorderColor: '{border.focus}',
        invalidBorderColor: '{border.danger}',
        color: '{text.primary}',
        disabledColor: '{surface.500}',
        placeholderColor: '{text.muted}',
        invalidPlaceholderColor: '{danger.300}',
        iconColor: '{primary.300}',
        focusRing: {
          width: '4px',
          style: 'solid',
          color: '{primary.950}',
          offset: '0px',
        },
      },
    },
  },
};
