import { AccessPointStamp } from "./access-point-stamp.model";

export interface AccessPoint {
    id: string;
    bssid: string;
    manufacturer: string;
    ssid: string;
    frequency: number;
    deviceType: string;
    contributorId: string;
    creationTimestamp: Date;
    versionTimestamp: Date;
    lowSignalLevel: number;
    lowSignalLatitude: number;
    lowSignalLongitude: number;
    highSignalLevel: number;
    highSignalLatitude: number;
    highSignalLongitude: number;
    signalRadius: number;
    signalArea: number;
    rawSecurityPayload: string;
    securityStandards: string;
    securityProtocols: string;
    isSecure: boolean;
    isPresent: boolean;
    runIdentifier: string; 
    note: string;
    displayStatus: boolean;
    stamps: Array<AccessPointStamp>;
}