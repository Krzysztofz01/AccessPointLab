import { Injectable } from '@angular/core';
import { GlobalScopeService } from './global-scope.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AccessPoint } from '../models/access-points.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AccessPointStamp } from '../models/access-point-stamp.model';

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

  private getLocalCachingHeaders(): HttpHeaders {
    return new HttpHeaders()
      .append(environment.HEADER_ALLOW_LOCAL_CACHE_NAME, environment.HEADER_ALLOW_LOCAL_CACHE_VALUE);
  }

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

  public deleteAccessPointRange(accessPointIds: Array<string>): Observable<void> {
    return this.httpClient.delete<void>(this.requestUrl('range'), { body: {
      ids: accessPointIds
    }});
  }

  public updateAccessPoint(accessPointId: string, note: string): Observable<void> {
    return this.httpClient.put<void>(this.requestUrl(), {
      id: accessPointId,
      note: note
    });
  }

  public changeAccessPointDisplayStatus(accessPointId: string, status: boolean) : Observable<void> {
    return this.httpClient.put<void>(this.requestUrl("display"), {
      id: accessPointId,
      status: status
    });
  }

  public changeAccessPointRangeDisplayStatus(accessPointIds: Array<string>, status: boolean): Observable<void> {
    return this.httpClient.put<void>(this.requestUrl('range/display'), {
      ids: accessPointIds,
      status: status
    });
  }

  public mergeAccessPoints(accessPointsId: string, accessPointStampId: string, mergeLowSignalLevel: boolean, mergeHighSignalLevel: boolean, mergeSsid: boolean, mergeSecurityData: boolean): Observable<void> {
    return this.httpClient.put<void>(this.requestUrl("merge"), {
      id: accessPointsId,
      stampId: accessPointStampId,
      mergeLowSignalLevel,
      mergeHighSignalLevel,
      mergeSsid,
      mergeSecurityData
    });
  }

  public deleteAccessPointStamp(accessPointId: string, accessPointStampId: string): Observable<void> {
    return this.httpClient.delete<void>(this.requestUrl("stamp"), { body: {
      id: accessPointId,
      stampId: accessPointStampId
    }});
  }

  public getAllAccessPoints(full: boolean, allowLocalCaching: boolean = true): Observable<Array<AccessPoint>> {  
    const path = full ? 'full' : '';

    return allowLocalCaching
      ? this.httpClient.get<Array<AccessPoint>>(this.requestUrl(path), { headers: this.getLocalCachingHeaders() })
      : this.httpClient.get<Array<AccessPoint>>(this.requestUrl(path));
  }

  public getAccessPointById(accessPointId: string, full: boolean): Observable<AccessPoint> {
    return full
      ? this.httpClient.get<AccessPoint>(this.requestUrl(`${accessPointId}/full`))
      : this.httpClient.get<AccessPoint>(this.requestUrl(accessPointId));
  }

  public getRunIds(full: boolean): Observable<Array<string>> {
    return full
      ? this.httpClient.get<Array<string>>(this.requestUrl('run/full'))
      : this.httpClient.get<Array<string>>(this.requestUrl('run'));
  }

  public getAccessPointsByRunId(runId: string, full: boolean): Observable<Array<AccessPoint>> {
    return full
      ? this.httpClient.get<Array<AccessPoint>>(this.requestUrl(`run/${runId}/full`))
      : this.httpClient.get<Array<AccessPoint>>(this.requestUrl(`run/${runId}`));
  }

  public getAccessPointStampsByRunId(runId: string, full: boolean): Observable<Array<AccessPointStamp>> {
    return full
      ? this.httpClient.get<Array<AccessPointStamp>>(this.requestUrl(`stamps/run/${runId}/full`))
      : this.httpClient.get<Array<AccessPointStamp>>(this.requestUrl(`stamps/run/${runId}`));
  }

  public searchAccessPoints(searchKeyword: string): Observable<Array<AccessPoint>> {
    const params = new HttpParams()
      .set('keyword', searchKeyword);

    return this.httpClient.get<Array<AccessPoint>>(this.requestUrl('search'), { params });
  }

  public getStatisticsGreatestSignalRange(limit: number|undefined = undefined, allowLocalCaching: boolean = true): Observable<Array<AccessPoint>> {
    const endpoint = 'statistics/signal';
    
    const headers = this.getLocalCachingHeaders();
    const params = new HttpParams();
    if (limit !== undefined) params.set('limit', limit);
    
    return allowLocalCaching
      ? this.httpClient.get<Array<AccessPoint>>(this.requestUrl(endpoint), { params, headers })
      : this.httpClient.get<Array<AccessPoint>>(this.requestUrl(endpoint), { params });
  }

  public getStatisticsFrequency(limit: number|undefined = undefined, allowLocalCaching: boolean = true): Observable<[frequency: number, count: number]> {
    const endpoint = 'statistics/frequency';
    
    const headers = this.getLocalCachingHeaders();
    const params = new HttpParams();
    if (limit !== undefined) params.set('limit', limit);

    return allowLocalCaching
      ? this.httpClient.get<[frequency: number, count: number]>(this.requestUrl(endpoint), { params, headers })
      : this.httpClient.get<[frequency: number, count: number]>(this.requestUrl(endpoint), { params });
  }

  public getStatisticsMostCommonManufacturer(limit: number|undefined = undefined, allowLocalCaching: boolean = true): Observable<[manufacturer: string, count: number]> {
    const endpoint = 'statistics/manufacturer';

    const headers = this.getLocalCachingHeaders();
    const params = new HttpParams();
    if (limit !== undefined) params.set('limit', limit);

    return allowLocalCaching
      ? this.httpClient.get<[manufacturer: string, count: number]>(this.requestUrl(endpoint), { params, headers })
      : this.httpClient.get<[manufacturer: string, count: number]>(this.requestUrl(endpoint), { params });
  }

  public getStatisticsMostCommonEncryption(limit: number|undefined = undefined, allowLocalCaching: boolean = true): Observable<[encryption: string, count: number]> {
    const endpoint = 'statistics/encryption';

    const headers = this.getLocalCachingHeaders();
    const params = new HttpParams();
    if (limit !== undefined) params.set('limit', limit);

    return allowLocalCaching
      ? this.httpClient.get<[encryption: string, count: number]>(this.requestUrl(endpoint), { params, headers })
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

  public getAccessPointsInKmlFile(full: boolean) : Observable<Blob> {
    const path = full ? 'kml/full' : 'kml';
    return this.httpClient.get(this.requestUrl(path), { responseType: 'blob' })
  }

  public getAccessPointsWigleCsv(): Observable<Blob> {
    return this.httpClient.get(this.requestUrl('wigle/csv', true), { responseType: 'blob' });
  }
}