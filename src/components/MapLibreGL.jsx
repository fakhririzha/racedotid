/* eslint-disable react/prop-types */
import * as dayjs from 'dayjs';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as React from 'react';

const MapLibreGLMap = ({
    eventData,
    // raceData,
    activeRaceData,
    activePlayerData,
    activePlayerKey,
    activePlayerSingle,
    mapRef,
    mapLibre,
    setMapLibre,
}) => {
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
        const map = new maplibregl.Map({
            container: mapRef.current, // container id
            style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=duLQBPKlGnKBOjUnRfnO', // style URL
            center: [107.6196, -6.87063],
            zoom: 15,
        });
        setMapLibre(map);
    }, [mapRef, setMapLibre]);

    React.useEffect(() => {
        if (mapRef && eventData && eventData.maseRoute) {
            if (mapLibre._loaded) {
                const parsedRoutes = JSON.parse(eventData.maseRoute);

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
                        'line-color': '#000000',
                        'line-width': 4,
                    },
                });

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

                if (document.getElementById('startEl')) {
                    document.getElementById('startEl').remove();
                    document.getElementById('finishEl').remove();
                }

                createMarker(routeCoordinates[0], 'startEl', 'redflag.png');
                createMarker(
                    routeCoordinates[routeCoordinates.length - 1],
                    'finishEl',
                    'redflag.png'
                );
            }
        }
    }, [eventData, mapRef, mapLibre, createMarker]);

    React.useEffect(() => {
        if (activePlayerData && activePlayerKey) {
            const playerPoint = document.querySelectorAll("[id^='playerEl-']");
            const playerPopup = document.querySelectorAll(
                "[class*='playerPopup-']"
            );
            if (playerPoint.length > 0) {
                playerPoint.forEach((el) => el.remove());
                playerPopup.forEach((el) => el.remove());
            }

            activePlayerKey.forEach((playerId) => {
                const playerData = activePlayerData[playerId];
                const coordinates = [
                    playerData[0].Longitude,
                    playerData[0].Latitude,
                ];

                let capturedTime = dayjs(playerData[0].CapturedTime);
                let nowTime = dayjs(Date.now());
                const timeDiff = nowTime.diff(capturedTime, 'minutes');

                createMarker(
                    coordinates,
                    `playerEl-${playerData[0].BIBNo}`,
                    timeDiff > 30 ? 'reddot.png' : 'greendot.png'
                );
                createPopup(
                    coordinates,
                    `<h1>#${playerData[0].BIBNo}</h1>`,
                    `playerPopup-${playerData[0].BIBNo}`
                );
            });
        }
    }, [
        activeRaceData,
        activePlayerData,
        activePlayerKey,
        createMarker,
        createPopup,
        mapLibre,
    ]);

    React.useEffect(() => {
        if (activePlayerSingle) {
            const idx = activePlayerSingle.split('_')[0];
            const participantObject = activePlayerData[idx];
            const coordinates = [
                participantObject[0].Longitude,
                participantObject[0].Latitude,
            ];

            mapLibre.fitBounds(
                new maplibregl.LngLatBounds(coordinates, coordinates),
                { padding: 20 }
            );

            const timeDiff = dayjs().diff(
                dayjs(participantObject[0].CapturedTime),
                'minutes'
            );

            if (document.getElementById('playerEl')) {
                document.getElementById('playerEl').remove();
            }

            createMarker(
                coordinates,
                'playerEl',
                timeDiff > 30 ? 'reddot.png' : 'greendot.png'
            );
        }
    }, [activePlayerData, activePlayerSingle, createMarker, mapLibre]);

    return (
        <>
            <div ref={mapRef} id="map" className="h-full" />
        </>
    );
};
export default MapLibreGLMap;
