import { AccessPoint } from "src/app/core/models/access-points.model";

export interface AccessPointDetailsV2Event {
    accessPoint: AccessPoint;
    targetViewName: string;
    reloadEntity: boolean;
}