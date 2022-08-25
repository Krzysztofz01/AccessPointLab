import { AccessPointStamp } from "src/app/core/models/access-point-stamp.model";
import { AccessPoint } from "src/app/core/models/access-points.model";

export function mapStampToAccessPoint(accessPointStamp: AccessPointStamp): AccessPoint {
    return {
        id: accessPointStamp.id,
        bssid: undefined,
        manufacturer: undefined,
        ssid: accessPointStamp.ssid,
        frequency: accessPointStamp.frequency,
        deviceType: accessPointStamp.deviceType,
        contributorId: accessPointStamp.contributorId,
        creationTimestamp: accessPointStamp.creationTimestamp,
        versionTimestamp: undefined,
        lowSignalLevel: accessPointStamp.lowSignalLevel,
        lowSignalLatitude: accessPointStamp.lowSignalLatitude,
        lowSignalLongitude: accessPointStamp.lowSignalLongitude,
        highSignalLevel: accessPointStamp.highSignalLevel,
        highSignalLatitude: accessPointStamp.highSignalLatitude,
        highSignalLongitude: accessPointStamp.highSignalLongitude,
        signalRadius: accessPointStamp.signalRadius,
        signalArea: accessPointStamp.signalArea,
        rawSecurityPayload: accessPointStamp.rawSecurityPayload,
        securityStandards: accessPointStamp.securityStandards,
        securityProtocols: accessPointStamp.securityProtocols,
        isSecure: accessPointStamp.isSecure,
        isPresent: accessPointStamp.isPresent,
        runIdentifier: accessPointStamp.runIdentifier,
        note: undefined,
        displayStatus: undefined,
        stamps: undefined,
        adnnotations: undefined,
        isStamp: true
    } as AccessPoint;
}