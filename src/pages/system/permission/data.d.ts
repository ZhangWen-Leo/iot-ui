import { DimensionsSetting } from "../dimensions/data";

export class PermissionItem {
    id: string;
    permission?: string;
    dimensionType?: string;
    dimensionTypeName?: string;
    dimensionTarget?: string;
    dimensionTargetName?: string;
    actions?: PermissionAction[];
    dataAccesses?: DataAccess[];
    merge?: boolean;
    state: number;
    priority: number;

    name: string;
    status: number;
    current?: Partial<DimensionsSetting>;//当前用户设置的权限
    type?: string;
    properties?: any;
    optionalFields?: DataViewItem[];
    open?: boolean;
    checkedAction?: string[];
    checkAll?: boolean;
    describe?: string;
    parents?: any[];
    supportDataAccessTypes?: string[];
}
export interface PermissionAction {
    action: string;
    describe: string;
    name?: string;
    properties?: any;
    key?: string;
    defaultCheck?: boolean | string;
    checked?: boolean;
}

export interface AssociationPermissionItem {
    key: string;
    preActions: string[] | any[];
    permission: string;
    actions: string[] | any[];
}

export interface DataViewItem {
    key: string;
    name: string;
    describe: string;
}

export interface DataAccess {
    action: string;
    config: {
        fields: string[]
    };
    describe?: string;
    type: string;
}