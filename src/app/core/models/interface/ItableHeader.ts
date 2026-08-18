
export interface ITableHeader {
  field: string;
  name: string;
  recordKey?: boolean;
  hidden?: boolean;
  sortable?: boolean;
  isPrimary?: boolean;
  isClickable?: boolean;
  cssClass?: string;
  type?: any;
  width?: number;
  extraCellData?: string;
  extraColumnData?: string;
  dateFormat?: string;
  nullValue?: string;
  tooltip?: string;
  dynamicStyle?:string
  imageField?: string;
}
