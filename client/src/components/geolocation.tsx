"use client";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type IGeoLocation = {
  permissionState: PermissionState;
  currentLocation?: ILocation;
};

const GeoLocationContext = createContext<IGeoLocation | undefined>(undefined);

export default function GeoLocationProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const [location, setLocation] = useState<IGeoLocation>();

  const updateCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((posistion) => {
      setLocation({
        permissionState: "granted",
        currentLocation: {
          lat: posistion.coords.latitude,
          lng: posistion.coords.longitude,
        },
      });
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.permissions.query({ name: "geolocation" }).then(({ state }) => {
      setLocation({ permissionState: state });
      updateCurrentLocation();
    });
  }, []);
  return (
    <GeoLocationContext.Provider value={location}>
      {children}
    </GeoLocationContext.Provider>
  );
}

export function useGeoLocation() {
  const location = useContext(GeoLocationContext);
  return location;
}
