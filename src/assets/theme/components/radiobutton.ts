// tokens/radiobutton.ts
import { spacing } from '../primitives/spacing';
import { typography } from '../primitives/typograpy';
import { semantic } from '../semantics/semantic';

export const radiobutton = {
  root: {
    width: spacing[20], 
    height: spacing[20],
    transitionDuration: '0.2s',
  },
  
  colorScheme: {
    light: {
      root: {
        background: semantic.colorScheme.light.formField.background,
        disabledBackground: semantic.colorScheme.light.formField.disabledBackground,
        borderColor: semantic.colorScheme.light.formField.borderColor,
        hoverBorderColor: semantic.colorScheme.light.formField.hoverBorderColor,
        focusBorderColor: semantic.colorScheme.light.formField.focusBorderColor,
        invalidBorderColor: semantic.colorScheme.light.formField.invalidBorderColor,
        
        checkedBackground: semantic.primary[600],
        checkedHoverBackground: semantic.primary[700],
        checkedBorderColor: semantic.primary[600],
        checkedHoverBorderColor: semantic.primary[700],
        checkedFocusBorderColor: semantic.primary[600],
        checkedDisabledBorderColor: semantic.colorScheme.light.formField.borderColor,
      },
      icon: {
        checkedColor: semantic.colorScheme.light.surface[0], 
        checkedHoverColor: semantic.colorScheme.light.surface[200],
        disabledColor: semantic.colorScheme.light.formField.disabledColor,
      },
    },
    
    dark: {
      root: {
        background: semantic.colorScheme.dark.formField.background,
        disabledBackground: semantic.colorScheme.dark.formField.disabledBackground,
        borderColor: semantic.colorScheme.dark.formField.borderColor,
        hoverBorderColor: semantic.colorScheme.dark.formField.hoverBorderColor,
        focusBorderColor: semantic.colorScheme.dark.formField.focusBorderColor,
        invalidBorderColor: semantic.colorScheme.dark.formField.invalidBorderColor,
        
        checkedBackground: semantic.primary[500],
        checkedHoverBackground: semantic.primary[400],
        checkedBorderColor: semantic.primary[500],
        checkedHoverBorderColor: semantic.primary[400],
        checkedFocusBorderColor: semantic.primary[500],
        checkedDisabledBorderColor: semantic.colorScheme.dark.formField.borderColor,
      },
      icon: {
        checkedColor: semantic.colorScheme.dark.surface[900],
        checkedHoverColor: semantic.colorScheme.dark.surface[900],
        disabledColor: semantic.colorScheme.dark.formField.disabledColor,
      },
    },
  },
};