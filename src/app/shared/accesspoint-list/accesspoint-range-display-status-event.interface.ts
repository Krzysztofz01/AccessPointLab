import { AccessPoint } from "src/app/core/models/access-points.model";

export interface AccessPointRangeDisplayStatusEvent {
    accessPoints: Array<AccessPoint>;
    targetStatus: boolean;
}