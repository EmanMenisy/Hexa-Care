

import { radius } from '../primitives/radius';
import { spacing } from '../primitives/spacing';
import { semantic } from '../semantics/semantic';

export const inputtext = {
  colorScheme: {
    light: {
      root: {
        background: semantic.colorScheme.light.formField.background,
        borderColor: semantic.colorScheme.light.formField.borderColor,
        color: semantic.colorScheme.light.formField.color,
        placeholderColor: semantic.colorScheme.light.formField.placeholderColor,
        hoverBorderColor: semantic.colorScheme.light.formField.hoverBorderColor,
        focusBorderColor: semantic.colorScheme.light.formField.focusBorderColor,
        invalidBorderColor: semantic.colorScheme.light.formField.invalidBorderColor,

      },
    },
    dark: {
      root: {
        background: semantic.colorScheme.dark.formField.background,
        borderColor: semantic.colorScheme.dark.formField.borderColor,
        color: semantic.colorScheme.dark.formField.color,
        placeholderColor: semantic.colorScheme.dark.formField.placeholderColor,
        hoverBorderColor: semantic.colorScheme.dark.formField.hoverBorderColor,
        focusBorderColor: semantic.colorScheme.dark.formField.focusBorderColor,
        invalidBorderColor: semantic.colorScheme.dark.formField.invalidBorderColor,
        // focusRing: {
        //   width: '4px',
        //   style: 'solid',
        //   color: semantic.primary[950],
        //   offset: '0px',
        // },
      },
    },
  },
};
;