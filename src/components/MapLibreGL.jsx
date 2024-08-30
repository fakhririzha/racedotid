/* eslint-disable react/prop-types */
import * as dayjs from 'dayjs';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as React from 'react';

const MapLibreGLMap = ({
    eventData,
    // raceData,
    activePlayerData,
    activePlayerKey,
    activePlayerSingle,
    mapRef,
    mapLibre,
    setMapLibre,
}) => {
    // console.log('2731-eventData', eventData);
    // console.log('2731-raceData', raceData);
    // console.log('2731-activePlayerData', activePlayerData);
    // console.log('2731-activePlayerKey', activePlayerKey);
    // console.log('2731-activePlayerSingle', activePlayerSingle);

    React.useEffect(() => {
        const map = new maplibregl.Map({
            container: mapRef.current, // container id
            style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=duLQBPKlGnKBOjUnRfnO', // style URL
            center: [107.6196, -6.87063],
            zoom: 15,
        });
        setMapLibre(map);
    }, []);

    React.useEffect(() => {
        if (mapRef && eventData && eventData.maseRoute) {
            const mappedJson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            properties: {},
                            coordinates:
                                eventData.maseRoute.features[0].geometry
                                    .coordinates,
                        },
                    },
                ],
            };

            if (mapLibre._loaded) {
                if (mapLibre.getSource('LineString')) {
                    mapLibre.removeLayer('LineString');
                    mapLibre.removeSource('LineString');
                }
                mapLibre.addSource('LineString', {
                    type: 'geojson',
                    data: mappedJson,
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
                        'line-color': '#000000',
                        'line-width': 4,
                    },
                });

                const coordinates =
                    eventData.maseRoute.features[0].geometry.coordinates;
                const bounds = coordinates.reduce(
                    (bounds, coords) => {
                        return bounds.extend(coords);
                    },
                    new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
                );

                mapLibre.fitBounds(bounds, {
                    padding: 20,
                });

                if (document.getElementById('startEl')) {
                    document.getElementById('startEl').remove();
                    document.getElementById('finishEl').remove();
                }

                const startEl = document.createElement('img');
                startEl.src = 'redflag.png';
                startEl.id = 'startEl';
                const finishEl = document.createElement('img');
                finishEl.src = 'redflag.png';
                finishEl.id = 'finishEl';
                new maplibregl.Marker({ element: startEl })
                    .setLngLat(
                        eventData.maseRoute.features[0].geometry.coordinates[0]
                    )
                    .addTo(mapLibre);
                new maplibregl.Marker({ element: finishEl })
                    .setLngLat(
                        eventData.maseRoute.features[0].geometry.coordinates[
                            eventData.maseRoute.features[0].geometry.coordinates
                                .length - 1
                        ]
                    )
                    .addTo(mapLibre);
            }
        }
    }, [eventData, mapRef, mapLibre]);

    React.useEffect(() => {
        if (activePlayerData && activePlayerKey) {
            activePlayerKey.forEach((item) => {
                console.log(activePlayerData[item]);

                const coordinates = [
                    [
                        activePlayerData[item][0].Longitude,
                        activePlayerData[item][0].Latitude,
                    ],
                ];

                if (
                    document.getElementById(
                        `playerEl-${activePlayerData[item][0].BIBNo}`
                    )
                ) {
                    document
                        .getElementById(
                            `playerEl-${activePlayerData[item][0].BIBNo}`
                        )
                        .remove();
                }

                let capturedTime = dayjs(
                    activePlayerData[item][0].CapturedTime
                );
                let receivedTime = dayjs(
                    activePlayerData[item][0].ReceivedTime
                );

                const timeDiff = receivedTime.diff(capturedTime, 'minutes');

                const playerEl = document.createElement('img');
                playerEl.src = timeDiff > 30 ? 'reddot.png' : 'greendot.png';
                playerEl.id = `playerEl-${activePlayerData[item][0].BIBNo}`;
                new maplibregl.Marker({ element: playerEl, scale: 0.5 })
                    .setLngLat(coordinates[0])
                    .addTo(mapLibre);
                new maplibregl.Popup({
                    closeOnClick: false,
                    className: 'popup-libregl',
                    closeButton: false,
                })
                    .setLngLat(coordinates[0])
                    .setHTML(`<h1>#${activePlayerData[item][0].BIBNo}</h1>`)
                    .addTo(mapLibre);
            });
        }
    }, [activePlayerData, activePlayerKey, mapLibre]);

    React.useEffect(() => {
        if (activePlayerSingle) {
            let idx = activePlayerSingle.split('_')[0];
            let participantObject = activePlayerData[idx];

            const coordinates = [
                [participantObject[0].Longitude, participantObject[0].Latitude],
            ];
            const bounds = coordinates.reduce(
                (bounds, coords) => {
                    return bounds.extend(coords);
                },
                new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
            );

            mapLibre.fitBounds(bounds, {
                padding: 20,
            });

            let capturedTime = dayjs(participantObject[0].CapturedTime);
            let receivedTime = dayjs(participantObject[0].ReceivedTime);

            const timeDiff = receivedTime.diff(capturedTime, 'minutes');

            if (document.getElementById('playerEl')) {
                document.getElementById('playerEl').remove();
            }

            const playerEl = document.createElement('img');
            playerEl.src = timeDiff > 30 ? 'reddot.png' : 'greendot.png';
            playerEl.id = 'playerEl';
            new maplibregl.Marker({ element: playerEl, scale: 0.5 })
                .setLngLat(coordinates[0])
                .addTo(mapLibre);
        }
    }, [activePlayerData, activePlayerSingle, mapLibre]);

    return (
        <>
            <div ref={mapRef} id="map" className="h-full" />
        </>
    );
};
export default MapLibreGLMap;
