// // tokens/select.ts
// import { radius } from '../primitives/radius';
// import { spacing } from '../primitives/spacing';
// import { semantic } from '../semantics/semantic';

// export const select = {
//   root: {
//     paddingX: spacing[10],
//     paddingY: spacing[8],
//     borderRadius: radius.xl,
//     transitionDuration: '0.4s',
//   },
//   colorScheme: {
//     light: {
//       dropdown: {
//         color: semantic.colorScheme.light.formField.color, 
//       },
//       clearIcon: {
//         color: semantic.colorScheme.light.formField.placeholderColor,
//       },
//       checkmark: {
//         color: semantic.primary[600], 
//       },
//       overlay: {
//         background: semantic.colorScheme.light.surface[0],
//         borderColor: semantic.colorScheme.light.border.default,
//         color: semantic.colorScheme.light.text.primary,
//       },

//     },
//     dark: {
//       dropdown: {
//         color: semantic.colorScheme.dark.formField.color,
//       },
//       clearIcon: {
//         color: semantic.colorScheme.dark.formField.placeholderColor,
//       },
//       checkmark: {
//         color: semantic.primary[400],
//       },
//       overlay: {
//         background: semantic.colorScheme.dark.surface[50],
//         borderColor: semantic.colorScheme.dark.border.default,
//         color: semantic.colorScheme.dark.text.primary,
//       },
//       option: {
//         color: semantic.colorScheme.dark.text.primary,
//         focusBackground: semantic.colorScheme.dark.surface[100],
//         focusColor: semantic.colorScheme.dark.text.primary,
//         selectedBackground: semantic.primary[800],
//         selectedColor: semantic.primary[100],
//         selectedFocusBackground: semantic.primary[700],
//         selectedFocusColor: semantic.primary[50],
//       },
//     },
//   },
// };