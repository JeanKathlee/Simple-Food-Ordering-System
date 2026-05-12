import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultCenter = { lat: 14.5995, lng: 120.9842 };

let leafletIconConfigured = false;

function ensureLeafletIcon() {
  if (leafletIconConfigured) {
    return;
  }

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });

  leafletIconConfigured = true;
}

async function reverseGeocode(lat, lng) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
  );

  if (!response.ok) {
    throw new Error("Unable to look up address");
  }

  const data = await response.json();
  return data.display_name || "";
}

async function searchPlaces(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Unable to search location");
  }

  return response.json();
}

export default function DeliveryMapPicker({ value, onChange }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("Search a place or drag the pin to set the address.");

  const currentAddress = useMemo(() => value || "", [value]);

  useEffect(() => {
    setSearchQuery(currentAddress);
  }, [currentAddress]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    ensureLeafletIcon();

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([defaultCenter.lat, defaultCenter.lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([defaultCenter.lat, defaultCenter.lng], {
      draggable: true,
    }).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    const syncAddressFromMarker = async (latlng) => {
      try {
        setStatus("Looking up address...");
        const address = await reverseGeocode(latlng.lat, latlng.lng);
        if (address) {
          onChange(address);
          setSearchQuery(address);
          setStatus("Address updated from pin location.");
        } else {
          setStatus("Pin updated, but no address was returned.");
        }
      } catch (error) {
        console.error("Reverse geocode failed:", error);
        setStatus("Could not resolve the pin location.");
      }
    };

    marker.on("dragend", () => {
      const latlng = marker.getLatLng();
      syncAddressFromMarker(latlng);
    });

    map.on("click", (event) => {
      marker.setLatLng(event.latlng);
      syncAddressFromMarker(event.latlng);
    });

    if (currentAddress) {
      searchPlaces(currentAddress)
        .then((placeResults) => {
          const firstResult = placeResults?.[0];
          if (firstResult) {
            const lat = Number(firstResult.lat);
            const lng = Number(firstResult.lon);
            map.setView([lat, lng], 15);
            marker.setLatLng([lat, lng]);
          }
        })
        .catch(() => {
          // Keep default center if the first lookup fails.
        });
    }

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [currentAddress, onChange]);

  const handleSearch = async () => {
    const query = searchQuery.trim();

    if (!query) {
      setResults([]);
      setStatus("Type a place to search.");
      return;
    }

    try {
      setStatus("Searching for places...");
      const foundPlaces = await searchPlaces(query);
      setResults(foundPlaces || []);
      setStatus(foundPlaces?.length ? "Choose a result or pin the map." : "No place found.");
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setStatus("Search failed. Try another place.");
    }
  };

  const choosePlace = async (place) => {
    const lat = Number(place.lat);
    const lng = Number(place.lon);
    const address = place.display_name || "";

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }

    onChange(address);
    setSearchQuery(address);
    setResults([]);
    setStatus("Address updated from search result.");
  };

  return (
    <div className="delivery-map-picker">
      <div className="delivery-map-search-row">
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Search your place"
        />
        <button type="button" onClick={handleSearch}>
          Search
        </button>
      </div>

      {results.length > 0 && (
        <div className="delivery-map-results">
          {results.map((place) => (
            <button key={place.place_id} type="button" onClick={() => choosePlace(place)}>
              <strong>{place.display_name}</strong>
              <span>Tap to set pin here</span>
            </button>
          ))}
        </div>
      )}

      <div ref={mapContainerRef} className="delivery-map-canvas" />
      <p className="delivery-map-status">{status}</p>
    </div>
  );
}
