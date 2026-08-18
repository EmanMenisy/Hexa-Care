// import { radius } from "../primitives/radius";
// import { spacing } from "../primitives/spacing";
// import { typography } from "../primitives/typograpy";
// import { semantic } from "../semantics/semantic";

// export const dialog = {
//   root: {
//     borderRadius: radius.xl,
//   },
//   header: {
//     gap: '0.5rem',
//   },
//   title: {
//     fontSize: typography.fontSize.titleMd,
//     fontWeight: '600',
//   },

//   footer: {
//     padding: spacing[12],
//     gap: spacing[10],
//   },
//   colorScheme: {
//     light: {
//       root: {
//         background: semantic.colorScheme.light.surface[0],
//         borderColor: semantic.colorScheme.light.border.default,
//       },
//     },
//     dark: {
//       root: {
//         background: semantic.colorScheme.dark.surface[50],
//         borderColor: semantic.colorScheme.dark.border.default,
//         color: semantic.danger[700],
//       },
//     },
//   },
//   css: () => `
//     .p-dialog {
//       min-width: 400px;
//       min-height: 200px;
//     }
//     .p-dialog .p-dialog-content {
//       text-align: center;
//     }
//     .p-dialog-content {
//          color: ${semantic.danger[700]};
//          font-weight : ${typography.fontWeight.semibold} ;
//     }
//     .p-dark .p-dialog-content {
//          color: ${semantic.danger[100]};
//          font-weight : ${typography.fontWeight.semibold} ;
//     }
//   `,
// };