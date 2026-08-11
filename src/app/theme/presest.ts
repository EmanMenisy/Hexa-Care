import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { primitive } from './primitives/primitive';
import { typography } from './primitives/typograpy';
import { spacing } from './primitives/spacing';
import { semantic } from './semantics/semantic';
import { radius } from './primitives/radius';
// import { select } from './components/select';
import { button } from './components/buttons';
import { inputtext } from './components/inputText';
// import { datepicker } from './components/datePicker';
// import { dialog } from './components/dialog';
// import { confirmdialog } from './components/confirmdialog';
// import { multiselect } from './components/multiselect';
// import { radiobutton } from './components/radiobutton';
// import { checkbox } from './components/checkbox';

export const presest = definePreset(Aura, {
  primitive: {
    ...primitive,
    ...typography,
    ...spacing,
    ...radius
  },
  semantic,
  components: {
    // inputtext,
    // select,
    button,
    // datepicker,
    // dialog,
    // confirmdialog,
    // multiselect,
    // radiobutton,
    // checkbox
  }
});