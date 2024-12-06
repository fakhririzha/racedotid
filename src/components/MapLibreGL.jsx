/* eslint-disable react/prop-types */
import { useToast } from '@/components/hooks/use-toast';
import * as turf from '@turf/turf';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as React from 'react';

dayjs.extend(isSameOrAfter);

const MapLibreGLMap = ({
    eventData,
    raceData,
    activeRaceData,
    activeEventData,
    activePlayerData,
    activePlayerKey,
    activePlayerSingle,
    mapRef,
    mapLibre,
    setMapLibre,
    trailData,
    showPath,
    setActivePlayerSingle,
    autoZoom,
    // setAutoZoom,
    isShowName,
    isShowNumber,
    isShowLastSeen,
    isShowLegend,
}) => {
    const { toast } = useToast();

    const createMarker = React.useCallback(
        (coordinates, id, src) => {
            const marker = document.createElement('img');
            marker.src = src;
            marker.id = id;
            return new maplibregl.Marker({ element: marker, scale: 0.5 })
                .setLngLat(coordinates)
                .addTo(mapLibre);
        },
        [mapLibre]
    );

    const createPopup = React.useCallback(
        (coordinates, html, id) => {
            return new maplibregl.Popup({
                closeOnClick: false,
                className: id ? `${id} popup-libregl` : 'popup-libregl',
                closeButton: false,
            })
                .setLngLat(coordinates)
                .setHTML(html)
                .addTo(mapLibre);
        },
        [mapLibre]
    );

    React.useEffect(() => {
        const OSMStyles = {
            version: 8,
            sources: {
                osm: {
                    type: 'raster',
                    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '&copy; OpenStreetMap Contributors',
                    maxzoom: 19,
                },
            },
            layers: [
                {
                    id: 'osm',
                    type: 'raster',
                    source: 'osm', // This must match the source key above
                },
            ],
        };
        const map = new maplibregl.Map({
            container: mapRef.current, // container id
            // style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=duLQBPKlGnKBOjUnRfnO', // style URL
            style: OSMStyles, // style URL
            center: [98.50727, 2.88624],
            zoom: 5,
        });
        setMapLibre(map);
    }, [mapRef, setMapLibre]);

    React.useEffect(() => {
        if (
            mapRef &&
            eventData &&
            raceData &&
            raceData.length > 0 &&
            eventData.maseRoute
        ) {
            if (mapLibre._loaded) {
                const parsedRoutes = JSON.parse(eventData.maseRoute);
                const parsedWaypoints = JSON.parse(eventData.maseWaypoints);

                if (mapLibre.getSource('LineString')) {
                    mapLibre.removeLayer('LineString');
                    mapLibre.removeSource('LineString');
                }

                mapLibre.addSource('LineString', {
                    type: 'geojson',
                    data: parsedRoutes,
                });
                mapLibre.addLayer({
                    id: 'LineString',
                    type: 'line',
                    source: 'LineString',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': raceData[0].label
                            .toLowerCase()
                            .includes('nusantarun')
                            ? '#cb361b'
                            : '#000000',
                        'line-width': 8,
                    },
                });

                // const orig = parsedRoutes.features[0].geometry.coordinates[0];
                // const dest =
                //     parsedRoutes.features[0].geometry.coordinates[
                //         parsedRoutes.features[0].geometry.coordinates.length - 1
                //     ];

                // const pointRoute = {
                //     type: 'FeatureCollection',
                //     features: [
                //         {
                //             type: 'Feature',
                //             properties: {},
                //             geometry: {
                //                 type: 'LineString',
                //                 coordinates: [orig, dest],
                //             },
                //         },
                //     ],
                // };

                // const pointStart = {
                //     type: 'FeatureCollection',
                //     features: [
                //         {
                //             type: 'Feature',
                //             properties: {},
                //             geometry: {
                //                 type: 'Point',
                //                 coordinates: orig,
                //             },
                //         },
                //     ],
                // };

                // const lineDistance = turf.distance(
                //     pointRoute.features[0],
                //     'kilometers'
                // );

                // const arc = [];

                // const steps = 10000;

                // for (let i = 0; i < lineDistance; i += lineDistance / steps) {
                //     const segment = turf.along(
                //         pointRoute.features[0],
                //         i,
                //         'kilometers'
                //     );
                //     arc.push(segment.geometry.coordinates);
                // }

                // pointRoute.features[0].geometry.coordinates = arc;

                // mapLibre.addSource('PointRoute', {
                //     type: 'geojson',
                //     data: pointRoute,
                // });
                // mapLibre.addSource('PointStart', {
                //     type: 'geojson',
                //     data: pointStart,
                // });

                // mapLibre.addLayer({
                //     id: 'route',
                //     source: 'PointRoute',
                //     type: 'line',
                //     paint: {
                //         'line-width': 2,
                //         'line-color': '#007cbf',
                //     },
                // });

                // mapLibre.addLayer({
                //     id: 'point',
                //     source: 'PointStart',
                //     type: 'symbol',
                //     layout: {
                //         'icon-image': 'redflag.ng',
                //         'icon-rotate': ['get', 'bearing'],
                //         'icon-rotation-alignment': 'map',
                //         'icon-overlap': 'always',
                //         'icon-ignore-placement': true,
                //     },
                // });

                // const animate = () => {
                //     pointStart.features[0].geometry.coordinates =
                //         parsedRoutes.features[0].geometry.coordinates[counter];

                //     pointStart.features[0].properties.bearing = turf.bearing(
                //         turf.point(
                //             parsedRoutes.features[0].geometry.coordinates[
                //                 counter >= steps ? counter - 1 : counter
                //             ]
                //         ),
                //         turf.point(
                //             parsedRoutes.features[0].geometry.coordinates[
                //                 counter >= steps ? counter : counter + 1
                //             ]
                //         )
                //     );

                //     mapLibre.getSource('point').setData(pointStart);

                //     // Request the next frame of animation so long the end has not been reached.
                //     if (counter < steps) {
                //         requestAnimationFrame(animate);
                //     }

                //     setCounter((prevCount) => prevCount + 1);
                // };

                // setTimeout(() => {
                //     animate();
                // }, 2500);

                const playerPoint =
                    document.querySelectorAll("[id^='playerEl-']");
                if (playerPoint.length > 0) {
                    playerPoint.forEach((el) => el.remove());
                }

                const routeCoordinates =
                    parsedRoutes.features[0].geometry.coordinates;
                const bounds = routeCoordinates.reduce(
                    (bounds, coords) => bounds.extend(coords),
                    new maplibregl.LngLatBounds(
                        routeCoordinates[0],
                        routeCoordinates[0]
                    )
                );

                if (autoZoom === 'Map') {
                    mapLibre.fitBounds(bounds, { padding: 20 });
                }

                if (document.getElementById('startEl')) {
                    document.getElementById('startEl').remove();
                    document.getElementById('finishEl').remove();
                }

                createMarker(routeCoordinates[0], 'startEl', '../redflag.png');
                createMarker(
                    routeCoordinates[routeCoordinates.length - 1],
                    'finishEl',
                    '../finflag.png'
                );

                if (isShowLegend) {
                    const legendPopup = document.querySelectorAll(
                        "[class*='waypoints']"
                    );
                    const legendMarker =
                        document.querySelectorAll("[id^='waypoints-']");
                    if (legendPopup.length > 0) {
                        legendPopup.forEach((el) => el.remove());
                        legendMarker.forEach((el) => el.remove());
                    }
                    parsedWaypoints.features.map((waypoints, index) => {
                        createMarker(
                            waypoints.geometry.coordinates,
                            `waypoints-${index}`,
                            '../legend.png'
                        );
                        createPopup(
                            waypoints.geometry.coordinates,
                            `<h1 style="font-size: 8px;">${waypoints.properties.Name}</h1>`,
                            `waypoints`
                        );
                    });
                } else {
                    const legendPopup = document.querySelectorAll(
                        "[class*='waypoints']"
                    );
                    const legendMarker =
                        document.querySelectorAll("[id^='waypoints-']");
                    if (legendPopup.length > 0) {
                        legendPopup.forEach((el) => el.remove());
                        legendMarker.forEach((el) => el.remove());
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventData, raceData, mapRef, mapLibre, createMarker, isShowLegend]);

    React.useEffect(() => {
        if (activePlayerData && activePlayerKey && eventData) {
            const parsedRoutes = JSON.parse(eventData.maseRoute);

            const playerPoint = document.querySelectorAll(
                "[id^='playerElSpecific-']"
            );
            const playerPopup = document.querySelectorAll(
                "[class*='playerPopup-']"
            );
            if (playerPoint.length > 0) {
                playerPoint.forEach((el) => el.remove());
                playerPopup.forEach((el) => el.remove());
            }

            activePlayerKey.forEach((playerId) => {
                const playerData = activePlayerData[playerId][0];

                if (playerData['eventId'] != activeEventData.split('_')[0]) {
                    return;
                }

                const coordinates = [playerData.Longitude, playerData.Latitude];

                if (coordinates[0] === null || coordinates[1] === null) {
                    createMarker(
                        parsedRoutes.features[0].geometry.coordinates[0],
                        `playerElSpecific-${playerData.BIBNo}`,
                        '../greydot.png'
                    );
                    createPopup(
                        parsedRoutes.features[0].geometry.coordinates[0],
                        `<h1>#${playerData.BIBNo}</h1>`,
                        `playerPopup-${playerData.BIBNo}`
                    );
                } else {
                    let capturedTime = dayjs(playerData.CapturedTime);
                    let nowTime = dayjs(Date.now());
                    const timeDiff = nowTime.diff(capturedTime, 'minutes');

                    createMarker(
                        coordinates,
                        `playerElSpecific-${playerData.BIBNo}`,
                        timeDiff > 30 ? '../reddot.png' : '../greendot.png'
                    );
                    createPopup(
                        coordinates,
                        `<h1>#${playerData.BIBNo}</h1>`,
                        `playerPopup-${playerData.BIBNo}`
                    );
                }
            });
        }
    }, [
        activeRaceData,
        activeEventData,
        activePlayerData,
        activePlayerKey,
        createMarker,
        createPopup,
        mapLibre,
        eventData,
    ]);

    React.useEffect(() => {
        if (activePlayerSingle) {
            const parsedRoutes = JSON.parse(eventData.maseRoute);
            const lineCoordinates = parsedRoutes;
            const lineJustCoordinates =
                lineCoordinates.features[0].geometry.coordinates;
            const pointRoutes = lineJustCoordinates.map((point) =>
                turf.point(point)
            );
            const featureCollectionRoutes = turf.featureCollection(pointRoutes);

            const idx = activePlayerSingle.split('_')[0];

            const filteredTrailData = trailData.filter((participant) => {
                return participant['BIBNo'] == idx;
            });

            const pCapturedTime = filteredTrailData[0]['CapturedTime'];
            const pLongitude = filteredTrailData[0]['Longitude'];
            const pLatitude = filteredTrailData[0]['Latitude'];

            if (!pLongitude || !pLatitude || !pCapturedTime) {
                toast({
                    // variant: 'destructive',
                    title: 'Koordinat peserta tidak ditemukan.',
                    description: 'Silahkan coba beberapa saat lagi.',
                    // action: <ToastAction altText="Try again">Try again</ToastAction>,
                });
                setActivePlayerSingle(null);
                return;
            }

            const participantCapturedTime = pCapturedTime.split(',');
            const participantLongitude = pLongitude.split(',');
            const participantLatitude = pLatitude.split(',');

            const participantCoordinates = [];
            for (let i = 0; i < participantLongitude.length; i++) {
                const isCapturedTimeAfterRaceStart = dayjs(
                    participantCapturedTime[i]
                ).isSameOrAfter(eventData.maseStartTime);
                if (isCapturedTimeAfterRaceStart) {
                    participantCoordinates.push([
                        parseFloat(participantLongitude[i]),
                        parseFloat(participantLatitude[i]),
                    ]);
                }
            }

            if (showPath) {
                const participantRoute = {
                    features: [
                        {
                            geometry: {
                                coordinates: participantCoordinates,
                                type: 'LineString',
                            },
                            properties: {
                                name: null,
                                time: null,
                            },
                            type: 'Feature',
                        },
                    ],
                    type: 'FeatureCollection',
                };

                if (mapLibre.getSource('ParticipantRoute')) {
                    mapLibre.removeLayer('ParticipantRoute');
                    mapLibre.removeSource('ParticipantRoute');
                }

                mapLibre.addSource('ParticipantRoute', {
                    type: 'geojson',
                    data: participantRoute,
                });
                mapLibre.addLayer({
                    id: 'ParticipantRoute',
                    type: 'line',
                    source: 'ParticipantRoute',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#FF0000',
                        'line-width': 4,
                    },
                });
            } else {
                if (mapLibre.getSource('ParticipantRoute')) {
                    mapLibre.removeLayer('ParticipantRoute');
                    mapLibre.removeSource('ParticipantRoute');
                }
            }

            const participantObject = activePlayerData[idx][0];
            const coordinates =
                participantObject.Longitude === null ||
                participantObject.Latitude === null
                    ? parsedRoutes.features[0].geometry.coordinates[0]
                    : [participantObject.Longitude, participantObject.Latitude];

            if (autoZoom === 'Participant') {
                mapLibre.fitBounds(
                    new maplibregl.LngLatBounds(coordinates, coordinates),
                    { padding: 20, zoom: 14 }
                );
            }

            // mapLibre.setZoom(18);

            const timeDiff = dayjs().diff(
                dayjs(participantObject.CapturedTime),
                'minutes'
            );

            if (document.getElementById('playerEl')) {
                document.getElementById('playerEl').remove();
            }

            let nearest = turf.nearestPoint(
                turf.point(coordinates),
                featureCollectionRoutes
            );

            const nearestPointFromParticipant = lineJustCoordinates.findIndex(
                (innerArr) => {
                    return innerArr.every(
                        (element, index) =>
                            element === nearest.geometry.coordinates[index]
                    );
                }
            );

            let distanceTotal = 0;

            for (let i = 0; i <= nearestPointFromParticipant; i++) {
                const current = lineJustCoordinates[i];
                const next = lineJustCoordinates[i + 1];
                if (current && next) {
                    distanceTotal += turf.distance(current, next);
                }
            }

            createMarker(
                coordinates,
                'playerEl',
                participantObject.Longitude === null
                    ? '../greydot.png'
                    : timeDiff > 30
                      ? '../reddot.png'
                      : '../greendot.png'
            );
            const playerPopup = document.querySelectorAll(
                "[class*='playerPopupComplete-']"
            );
            if (playerPopup.length > 0) {
                playerPopup.forEach((el) => el.remove());
            }
            let nameText = '';
            let numberText = '';
            let lastSeenText = '';
            if (isShowName) {
                nameText = `<h1>${participantObject.Name}</h1>`;
            } else {
                nameText = '';
            }
            if (isShowNumber) {
                numberText = `<h2>#${participantObject.BIBNo}</h2>`;
            }
            if (isShowLastSeen) {
                lastSeenText = `<h2><em>Last Seen: ${dayjs(participantObject.CapturedTime).format('DD-MM-YYYY HH:mm:ss')}</em></h2>`;
            } else {
                lastSeenText = '';
            }

            if (!isShowName && !isShowNumber) {
                numberText = `<h2>#${participantObject.BIBNo}</h2>`;
            }
            // createPopup(
            //     coordinates,
            //     `<div>
            //         <h1>#${participantObject.BIBNo}</h1>
            //         <h1>${participantObject.Name}</h1>
            //         <h2><em>Last Seen: ${dayjs(participantObject.CapturedTime).format('DD-MM-YYYY HH:mm:ss')}</em></h2>
            //         <!-- <h2>Distance Travelled: ${participantObject.Longitude === null ? 0 : distanceTotal.toLocaleString('id-ID', { style: 'decimal', maximumFractionDigits: 3 })}km</h2> -->
            //     </div>
            //     `,
            //     `playerPopupComplete-${participantObject.BIBNo}`
            // );
            createPopup(
                coordinates,
                `<div>
                    ${numberText}
                    ${nameText}
                    ${lastSeenText}
                    <!-- <h2>Distance Travelled: ${participantObject.Longitude === null ? 0 : distanceTotal.toLocaleString('id-ID', { style: 'decimal', maximumFractionDigits: 3 })}km</h2> -->
                </div>
                `,
                `playerPopupComplete-${participantObject.BIBNo}`
            );
            // if (
            //     autoZoom !== 'Reset' &&
            //     (autoZoom === true || autoZoom === 'Reset New Participant')
            // )
            //     setAutoZoom(false);
        } else if (eventData && autoZoom === 'Map') {
            const parsedRoutes = JSON.parse(eventData.maseRoute);

            const routeCoordinates =
                parsedRoutes.features[0].geometry.coordinates;
            const bounds = routeCoordinates.reduce(
                (bounds, coords) => bounds.extend(coords),
                new maplibregl.LngLatBounds(
                    routeCoordinates[0],
                    routeCoordinates[0]
                )
            );

            mapLibre.fitBounds(bounds, { padding: 20 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        activePlayerData,
        activePlayerSingle,
        createMarker,
        createPopup,
        eventData,
        mapLibre,
        trailData,
        showPath,
        toast,
        setActivePlayerSingle,
        autoZoom,
        isShowName,
        isShowNumber,
        isShowLastSeen,
    ]);

    return (
        <>
            <div ref={mapRef} id="map" className="h-full" />
        </>
    );
};
export default MapLibreGLMap;
