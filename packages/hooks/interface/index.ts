import type { FormInstance } from "element-plus";
export namespace Table {
  export interface Pageable {
    current: number;
    size: number;
    total: number;
  }
  export interface StateProps {
    tableData: any[];
    pageable: Pageable;
    loadingVisible: boolean;
    searchParam: {
      [key: string]: any;
    };
    searchInitParam: {
      [key: string]: any;
    };
    totalParam: {
      [key: string]: any;
    };
    icon?: {
      [key: string]: any;
    };
    searchRef: {
      formEl: FormInstance | null;
      submitSearch: () => void;
    };
  }
}

export namespace HandleData {
  export type MessageType = "" | "success" | "warning" | "info" | "error";
}

export namespace Theme {
  export type GreyOrWeakType = "grey" | "weak";
}
