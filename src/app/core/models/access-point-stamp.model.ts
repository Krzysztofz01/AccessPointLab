export interface AccessPointStamp {
    id: string;
    ssid: string;
    frequency: number;
    deviceType: string;
    contributorId: string;
    creationTimestamp: Date;
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
    status: boolean;
}