'use client';

import MapLibreGLMap from '@/components/MapLibreGL';
// import OpenLayersMap from '@/components/OpenLayersMap';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

const Home = () => {
    const [raceData, setRaceData] = React.useState(null);
    const [eventData, setEventData] = React.useState(null);
    // const [participantData, setParticipantData] = React.useState(null);

    const [openRaceData, setOpenRaceData] = React.useState(false);
    // const [openEventData, setOpenEventData] = React.useState(false);
    const [activeRaceData, setActiveRaceData] = React.useState(null);
    const [activeEventData, setActiveEventData] = React.useState(null);
    const [activePlayerData, setActivePlayerData] = React.useState(null);
    const [activePlayerKey, setActivePlayerKey] = React.useState(null);

    const [openActivePlayerSingle, setOpenActivePlayerSingle] =
        React.useState(null);
    const [activePlayerSingle, setActivePlayerSingle] = React.useState(null);

    const mapRef = React.useRef(null);
    const [mapLibre, setMapLibre] = React.useState(null);

    const groupDataByRunnerBIBNo = (data) => {
        const groupedData = data.reduce((acc, current) => {
            const key = current.BIBNo;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(current);
            return acc;
        }, {});

        return groupedData;
    };

    React.useEffect(() => {
        const fetchData = async () => {
            const race = await fetch('https://map.race.id/api/race/1');
            const raceJson = await race.json();

            setRaceData(
                raceJson.map((race) => {
                    return {
                        value: `${race.maseId}_${race.raceName} - ${race.maseEventName}`,
                        label: `${race.raceName} - ${race.maseEventName}`,
                    };
                })
            );
        };
        fetchData();
    }, []);

    const fetchDataInterval = async () => {
        const race = await fetch('https://map.race.id/api/race/1');
        const raceJson = await race.json();

        setRaceData(
            raceJson.map((race) => {
                return {
                    value: `${race.maseId}_${race.raceName} - ${race.maseEventName}`,
                    label: `${race.raceName} - ${race.maseEventName}`,
                };
            })
        );
    };

    setTimeout(() => {
        fetchDataInterval();
    }, 60000);

    React.useMemo(() => {
        const fetchData = async () => {
            const event = await fetch(
                `https://map.race.id/api/event/${activeRaceData.split('_')[0]})}`
            );
            const eventJson = await event.json();

            setEventData({
                maseEndTime: eventJson[0].maseEndTime,
                maseEventName: eventJson[0].maseEventName,
                maseId: eventJson[0].maseId,
                maseRaceId: eventJson[0].maseRaceId,
                maseRoute: JSON.parse(eventJson[0].maseRoute),
                maseStartTime: eventJson[0].maseStartTime,
                maseWaypoints: JSON.parse(eventJson[0].maseWaypoints),
            });
        };
        if (activeRaceData) {
            fetchData();
        }
    }, [activeRaceData]);

    React.useMemo(() => {
        const fetchData = async () => {
            const participant = await fetch(
                `https://map.race.id/api/participantByRace/${activeEventData.split('_')[0]})}`
            );
            const participantJson = await participant.json();

            setActivePlayerData(groupDataByRunnerBIBNo(participantJson));
            setActivePlayerKey(
                Object.keys(groupDataByRunnerBIBNo(participantJson))
            );
        };
        if (activeEventData) {
            fetchData();
        }
    }, [activeEventData]);

    return (
        <main className="flex">
            <div className="sidebar basis-2/12 bg-primary p-4">
                <div className="title-wrapper my-2 text-center">
                    <span className="text-xl font-bold text-white">
                        Live Tracker.
                    </span>
                </div>
                <Separator />
                <div className="race-selector mt-4">
                    {raceData && (
                        <Popover
                            open={openRaceData}
                            onOpenChange={setOpenRaceData}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between"
                                >
                                    {activeRaceData
                                        ? raceData.find(
                                              (race) =>
                                                  race.value === activeRaceData
                                          )?.label
                                        : 'Select a race...'}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Select a race..." />
                                    <CommandList>
                                        <CommandEmpty>
                                            No race found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {raceData.map((race) => (
                                                <CommandItem
                                                    className="cursor-pointer"
                                                    key={race.value}
                                                    value={race.value}
                                                    onSelect={(
                                                        currentValue
                                                    ) => {
                                                        setActiveRaceData(
                                                            currentValue ===
                                                                activeRaceData
                                                                ? ''
                                                                : currentValue
                                                        );
                                                        setActiveEventData(
                                                            currentValue ===
                                                                activeRaceData
                                                                ? ''
                                                                : currentValue
                                                        );
                                                        setOpenRaceData(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4',
                                                            activeRaceData ===
                                                                race.value
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        )}
                                                    />
                                                    {race.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
                {activePlayerData && activePlayerKey && (
                    <div className="event-selector mt-4">
                        {activePlayerData && (
                            <Popover
                                open={openActivePlayerSingle}
                                onOpenChange={setOpenActivePlayerSingle}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {activePlayerSingle
                                            ? activePlayerSingle
                                            : 'Select a participant...'}
                                        {/* {activePlayerSingle
                                            ? activePlayerKey.find(
                                                  (event) =>
                                                      `${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}` ===
                                                      activePlayerSingle
                                              )?.label
                                            : 'Select a participant...'} */}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Select a participant..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                No event found.
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {activePlayerKey.map(
                                                    (event) => {
                                                        console.log(
                                                            '2731-index',
                                                            event
                                                        );
                                                        return (
                                                            <CommandItem
                                                                className="cursor-pointer"
                                                                key={`${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}`}
                                                                value={`${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}`}
                                                                onSelect={(
                                                                    currentValue
                                                                ) => {
                                                                    setActivePlayerSingle(
                                                                        currentValue ===
                                                                            activePlayerSingle
                                                                            ? ''
                                                                            : currentValue
                                                                    );
                                                                    setOpenActivePlayerSingle(
                                                                        false
                                                                    );
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        activePlayerSingle ===
                                                                            `${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}`
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                    )}
                                                                />
                                                                {`${activePlayerData[event][0].BIBNo}_${activePlayerData[event][0].Name}`}
                                                            </CommandItem>
                                                        );
                                                    }
                                                )}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                )}
                <div className="reset-button mt-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.location.reload();
                        }}
                        className="w-full"
                    >
                        Reset
                    </Button>
                </div>
            </div>
            <div className="map-wrapper h-[100vh] basis-10/12">
                {/* <OpenLayersMap
                    eventData={eventData}
                    raceData={raceData}
                    activePlayerData={activePlayerData}
                    activePlayerKey={activePlayerKey}
                    activePlayerSingle={activePlayerSingle}
                /> */}
                <MapLibreGLMap
                    eventData={eventData}
                    raceData={raceData}
                    activePlayerData={activePlayerData}
                    activePlayerKey={activePlayerKey}
                    activePlayerSingle={activePlayerSingle}
                    mapRef={mapRef}
                    mapLibre={mapLibre}
                    setMapLibre={setMapLibre}
                />
            </div>
        </main>
    );
};

export default Home;
