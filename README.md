![apl logo](https://user-images.githubusercontent.com/46250989/146814923-b11b9e32-7f5e-4699-8c0a-56c445771ffb.png)
#  AccessPointLab

The AccessPointLab project is a *fork* of the client application of the [AccessPointMap](https://github.com/Krzysztofz01/AccessPointMap) project (version **0.5.0**), with full compatibility with the latest version. AccessPointLab does not have the multi-user support, therefore it is much lighter and single-user-friendly. The purpose of AccessPointLab is to host it locally for local analysis of data collected by AccessPointMap and compatible platforms such as [Wigle](https://github.com/wiglenet/wigle-wifi-wardriving) or [Aircrack-ng](https://github.com/aircrack-ng/aircrack-ng). It allows you to connect to many AccessPointMap instances, so it is also suitable for audits and development of the AccessPointMap itself or related tools.

# Features

Only the necessary functionalities have been implemented in order to maintain the simplicity, avoid complexity and make the application lightweight. Supported features:
- Interactive map
- Stamp review and merging
- List with search engine
- Statistics
- Upload panel

## Technology stack
The same technologies were used as in the original version of the AccessPointMap client, of course updated to the latest versions:
- [Angular](https://github.com/angular/angular)
- [Openlayers](https://github.com/openlayers/openlayers)
- [Chart.js](https://github.com/chartjs/Chart.js)
- [Bootstrap](https://github.com/twbs/bootstrap)
- and [more](https://github.com/Krzysztofz01/AccessPointLab/blob/main/package.json)