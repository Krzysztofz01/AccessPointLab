import { Injectable } from '@angular/core';
import { GlobalScopeService } from './global-scope.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AccessPoint } from '../models/access-points.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessPointService {
  private serverAddress: string;
  private readonly basePathAccessPoints = 'accesspoints';
  private readonly basePathIntegration = 'integrations';

  constructor(private httpClient: HttpClient, private globalScopeService: GlobalScopeService) {
    this.globalScopeService.server.subscribe((server) => {
      this.serverAddress = server;
    });
  }

  private requestUrl(endpoint: string = '', integration: boolean = false, version: number = 1): string {
    return integration
      ? `${this.serverAddress}/api/v${version.toString()}/${this.basePathIntegration}/${endpoint}`
      : `${this.serverAddress}/api/v${version.toString()}/${this.basePathAccessPoints}/${endpoint}`;
  }

  /**
   * Post a collection of collected accesspoints
   * @param accessPoints Collection of collected accesspoints
   * @returns Observable of void
   */
  public postAccessPoints(accessPoints: Array<AccessPoint>): Observable<void> {
    return this.httpClient.post<void>(this.requestUrl(), {
      accessPoints: accessPoints,
      scanData: new Date()
    });
  }

  public deleteAccessPoint(accessPointId: string): Observable<void> {
    return this.httpClient.delete<void>(this.requestUrl(), { body: {
      id: accessPointId
    }});
  }

  public updateAccessPoint(accessPointId: string, note: string): Observable<void> {
    return this.httpClient.put<void>(this.requestUrl(), {
      id: accessPointId,
      note: note
    });
  }

  public changeAccessPointDisplayStatus(accessPointId: string, status: boolean) : Observable<void> {
    return this.httpClient.put<void>(this.requestUrl(), {
      id: accessPointId,
      status: status
    });
  }

  public mergeAccessPoints(accessPointsId: string, accessPointStampId: string, mergeLowSignalLevel: boolean, mergeHighSignalLeve: boolean, mergeSsid: boolean, mergeSecurityData: boolean): Observable<void> {
    return this.httpClient.put<void>(this.requestUrl(), {
      id: accessPointsId,
      stampId: accessPointStampId,
      mergeLowSignalLevel,
      mergeHighSignalLeve,
      mergeSsid,
      mergeSecurityData
    });
  }

  public deleteAccessPointStamp(accessPointId: string, accessPointStampId: string): Observable<void> {
    return this.httpClient.delete<void>(this.requestUrl(), { body: {
      id: accessPointId,
      stampId: accessPointStampId
    }});
  }

  public getAllAccessPoints(full: boolean): Observable<Array<AccessPoint>> {
    return full
      ? this.httpClient.get<Array<AccessPoint>>(this.requestUrl('full'))
      : this.httpClient.get<Array<AccessPoint>>(this.requestUrl());
  }

  public getAccessPointById(accessPointId: string, full: boolean): Observable<AccessPoint> {
    return full
      ? this.httpClient.get<AccessPoint>(this.requestUrl(`${accessPointId}/full`))
      : this.httpClient.get<AccessPoint>(this.requestUrl(accessPointId));
  }

  public searchAccessPoints(searchKeyword: string): Observable<Array<AccessPoint>> {
    const params = new HttpParams()
      .set('keyword', searchKeyword);

    return this.httpClient.get<Array<AccessPoint>>(this.requestUrl('search'), { params });
  }

  public getStatisticsGreatestSignalRange(limit: number|undefined = undefined): Observable<Array<AccessPoint>> {
    const params = new HttpParams()
      .set('limit', limit);

    const endpoint = 'statistics/signal';

    return (limit === undefined)
      ? this.httpClient.get<Array<AccessPoint>>(this.requestUrl(endpoint))
      : this.httpClient.get<Array<AccessPoint>>(this.requestUrl(endpoint), { params });
  }

  public getStatisticsFrequency(limit: number|undefined = undefined): Observable<[frequency: number, count: number]> {
    const params = new HttpParams()
      .set('limit', limit);

    const endpoint = 'statistics/frequency';

    return (limit === undefined)
      ? this.httpClient.get<[frequency: number, count: number]>(this.requestUrl(endpoint))
      : this.httpClient.get<[frequency: number, count: number]>(this.requestUrl(endpoint), { params });
  }

  public getStatisticsMostCommonManufacturer(limit: number|undefined = undefined): Observable<[manufacturer: string, count: number]> {
    const params = new HttpParams()
      .set('limit', limit);

    const endpoint = 'statistics/manufacturer';

    return (limit === undefined)
      ? this.httpClient.get<[manufacturer: string, count: number]>(this.requestUrl(endpoint))
      : this.httpClient.get<[manufacturer: string, count: number]>(this.requestUrl(endpoint), { params });
  }

  public getStatisticsMostCommonEncryption(limit: number|undefined = undefined): Observable<[encryption: string, count: number]> {
    const params = new HttpParams()
      .set('limit', limit);

    const endpoint = 'statistics/encryption';

    return (limit === undefined)
      ? this.httpClient.get<[encryption: string, count: number]>(this.requestUrl(endpoint))
      : this.httpClient.get<[encryption: string, count: number]>(this.requestUrl(endpoint), { params });
  }

  public postAccessPointsWigleCsv(scanCsvFile: File): Observable<void> {
    const formData = new FormData();
    formData.append('scanCsvFile', scanCsvFile);

    return this.httpClient.post<void>(this.requestUrl('wigle/csv', true), formData);
  }

  public postAccessPointsAircrackngCsv(scanCsvFile: File): Observable<void> {
    const formData = new FormData();
    formData.append('scanCsvFile', scanCsvFile);

    return this.httpClient.post<void>(this.requestUrl('aircrackng/csv', true), formData);
  }

  public postAccessPointsPacketsAircrackngCap(scanPcapFile : File): Observable<void> {
    const formData = new FormData();
    formData.append('scanPcapFile ', scanPcapFile);

    return this.httpClient.post<void>(this.requestUrl('aircrackng/cap', true), formData);
  }

  public postAccessPointsPacketsWiresharkPcap(scanPcapFile: File): Observable<void> {
    const formData = new FormData();
    formData.append('scanPcapFile ', scanPcapFile);

    return this.httpClient.post<void>(this.requestUrl('wireshark/pcap', true), formData);
  }
}