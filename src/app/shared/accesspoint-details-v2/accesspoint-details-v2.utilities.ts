import { format, parseISO } from 'date-fns';
import { Map, View } from 'ol';
import Attribution from 'ol/control/Attribution';
import { Circle } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import * as olProj from 'ol/proj';
import { OSM } from 'ol/source';
import { AccessPointStamp } from 'src/app/core/models/access-point-stamp.model';
import { AccessPoint } from "src/app/core/models/access-points.model";

export class AccessPointDetailsV2Utilities {
    /**
     * Generate CSS color according to the access points security standard
     * @param accessPoint Access point entity 
     * @returns CSS color variable string
     */
    public static getCssColorBySecurityStandard(accessPoint: AccessPoint): string {
        const sd: Array<string> = JSON.parse(accessPoint.securityStandards);
    
        if(sd.includes('WPA3')) return 'var(--apm-encryption-good)';
        if(sd.includes('WPA2')) return 'var(--apm-encryption-good)';
        if(sd.includes('WPA')) return 'var(--apm-encryption-good)';
        if(sd.includes('WPS')) return 'var(--apm-encryption-medium)';
        if(sd.includes('WEP')) return 'var(--apm-encryption-medium)';
        return 'var(--apm-encryption-bad)';
    }

    /**
     * Generate OpenLayers color according to the access points security standard
     * @param accessPoint Access point entity
     * @param opacity Result color alpha value
     * @returns OpenLayers color string
     */
    public static getOpenLayersColorBySecurityStandard(accessPoint: AccessPoint, opacity: number = 1.0): string {
        const sd: Array<string> = JSON.parse(accessPoint.securityStandards);

        if(sd.includes('WPA3')) return `rgba(104, 188, 0, ${opacity.toString()})`;
        if(sd.includes('WPA2')) return `rgba(104, 188, 0, ${opacity.toString()})`;
        if(sd.includes('WPA')) return `rgba(104, 188, 0, ${opacity.toString()})`;
        if(sd.includes('WPS')) return `rgba(243, 157, 43, ${opacity.toString()})`;
        if(sd.includes('WEP')) return `rgba(243, 157, 43, ${opacity.toString()})`;
        return `rgba(211, 49, 21, ${opacity.toString()})`;
    }

    /**
     * Generate a OpenLayers circle centered at the access point high signal level location
     * @param accessPoint Access point entity
     * @returns OpenLayers Circle object
     */
    public static getOpenLayersAccessPointRadiusCircle(accessPoint: AccessPoint | AccessPointStamp, minimalRadius: number = 16): Circle {
        const longitude = accessPoint.highSignalLongitude;
        const latitude = accessPoint.highSignalLatitude;
        const radius = accessPoint.signalRadius;

        return new Circle(olProj.fromLonLat([ longitude, latitude ]),
            (radius < minimalRadius) ? minimalRadius : radius);
    }

    /**
     * Generate the plain OpenLayers map with OSM tile layer
     * @param mapId Globaly unique map container indentifier
     * @param zoomLevel Initial map zoom level
     * @param layerNameKey The key of the layer name. Undefined by default, so the layer has no name
     * @returns 
     */
    public static createOpenLayersMap(mapId: string, zoomLevel: number, layerNameKey: string | undefined = undefined): Map {
        const tileLayer = new TileLayer({
            source: new OSM()
        });
        
        if (layerNameKey !== undefined)
            tileLayer.set(layerNameKey, mapId);

        return new Map({
            controls: [ new Attribution() ],
            target: mapId,
            layers: [ tileLayer ],
            view: new View({
                center: olProj.fromLonLat([0, 0]),
                zoom: zoomLevel
            })
        });
    }

    /**
     * Format array provided data
     * @param serializedArray Array of string data
     */
    public static formatSerialziedArrayData(serializedArray: string): string {
        if (serializedArray === undefined) return 'None';
    
        const arrayData = JSON.parse(serializedArray) as Array<string>;
        if (arrayData === undefined || arrayData.length === 0) return 'None';
    
        return arrayData.join(', ').toUpperCase();
    }

    /**
     * Determine if a given object is an instance of AccessPoint or AccessPointStamp
     * @param object AccessPoint or AccessPointStamp entity object
     * @returns Boolean value indicating if the object is a AccessPoint
     */
    public static isAccessPointInstance(object: AccessPoint | AccessPointStamp): boolean {
        return (
            (object instanceof Object) &&
            (!('status' in object)) &&
            ('displayStatus' in object)
        );
    }

    /**
     * Format the date to more user friendly format
     * @param date Date object
     * @returns Formated date as string
     */
    public static formatDate(date: Date | string): string {
        const dateFormat = 'dd-MM-yyyy HH:mm:ss';
        return (date instanceof Date)
            ? format(new Date(date), dateFormat)
            : format(parseISO(date), dateFormat);
    }
}
