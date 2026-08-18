// // tokens/datepicker.ts
// import { radius } from '../primitives/radius';
// import { spacing } from '../primitives/spacing';
// import { typography } from '../primitives/typograpy';
// import { semantic } from '../semantics/semantic';

// export const datepicker = {
//   panel: {
//     borderRadius: radius.xl,
//     padding: spacing[10],
//   },
//   date: {
//     borderRadius: radius.sm,
//   },
 
//   title: {
//     gap: spacing[2],
//     fontWeight: typography.fontWeight.semibold,
//   },
//   colorScheme: {
//     light: {
//       panel: {
//         background: semantic.colorScheme.light.surface[0],
//         borderColor: semantic.colorScheme.light.border.default,
//         color: semantic.colorScheme.light.text.primary,
//       },
//       header: {
//         background: semantic.colorScheme.light.surface[0],
//         borderColor: semantic.colorScheme.light.border.default,
//         color: semantic.colorScheme.light.text.primary,
//       },
//       selectMonth: {
//         color: semantic.colorScheme.light.text.primary,
//         hoverColor: semantic.primary[600],
//         hoverBackground: semantic.colorScheme.light.surface[100],
//       },
//       selectYear: {
//         color: semantic.colorScheme.light.text.primary,
//         hoverColor: semantic.primary[600],
//         hoverBackground: semantic.colorScheme.light.surface[100],
//       },
//       date: {
//         hoverBackground: semantic.colorScheme.light.surface[100],
//         hoverColor: semantic.colorScheme.light.text.primary,
//         selectedBackground: semantic.primary[500],
//         selectedColor: semantic.colorScheme.light.surface[0],
//         rangeSelectedBackground: semantic.primary[100],
//         rangeSelectedColor: semantic.primary[700],
//       },
//       today: {
//         background: semantic.primary[100],
//         color: semantic.primary[700],
//       },
//       inputIcon: {
//        color: semantic.primary[600],
//       },
//     },
//     dark: {
//       panel: {
//         background: semantic.colorScheme.dark.surface[950],
//         borderColor: semantic.colorScheme.dark.border.default,
//         color: semantic.colorScheme.dark.surface[0],
//       },
//       header: {
//         background: semantic.colorScheme.dark.surface[950],
//         borderColor: semantic.colorScheme.dark.border.default,
//         color: semantic.colorScheme.dark.text.primary,
//       },
//       selectMonth: {
//         color: semantic.primary[600],
//         hoverColor: semantic.primary[400],
//         hoverBackground: semantic.colorScheme.dark.surface[800],
//       },
//       selectYear: {
//         color:semantic.primary[600],
//         hoverColor: semantic.primary[400],
//         hoverBackground: semantic.colorScheme.dark.surface[800],
//       },
//       date: {
//         hoverBackground: semantic.colorScheme.dark.surface[100],
//         hoverColor: semantic.colorScheme.dark.text.primary,
//         selectedBackground: semantic.primary[300],
//         selectedColor: semantic.colorScheme.dark.surface[950],
//         rangeSelectedBackground: semantic.primary[800],
//         rangeSelectedColor: semantic.primary[100],
//       },
//       today: {
//         background: semantic.primary[800],
//         color: semantic.primary[100],
//       },
//       inputIcon: {
//         color: semantic.primary[300],
//        },
//     },
//   },
//    css: () => `
//     .p-datepicker-buttonbar .p-button {
//       color: ${semantic.primary[600]};
//     }
//     .app-dark .p-datepicker-buttonbar .p-button {
//       color: ${semantic.primary[400]};
//     }
//   `,
// };