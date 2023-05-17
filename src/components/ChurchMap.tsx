import { Tile3DLayer } from "@deck.gl/geo-layers/typed";
import { CesiumIonLoader } from "@loaders.gl/3d-tiles";
import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import Map, { NavigationControl, useControl, MapRef } from "react-map-gl";
import maplibregl from "maplibre-gl";

import { mapStyle } from "../mapHelpers";
import { useRef, useState } from "react";
import Loading from "./Loading";

const CESIUM_CONFIG = {
  assetId: 1691493,
  tilesetUrl: "https://assets.ion.cesium.com/1691493/tileset.json",
  token: import.meta.env.VITE_CESIUM,
};

const INITIAL_VIEW_STATE = {
  longitude: -48.5495,
  latitude: -27.5969,
  zoom: 9,
};

function DeckGLOverlay(
  props: MapboxOverlayProps & {
    interleaved?: boolean;
  }
) {
  const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

export default function ChurchMap() {
  const mapRef = useRef<MapRef>(null);
  const [loading, setLoading] = useState(true);

  const layer3D = new Tile3DLayer({
    id: "layer-3d",
    pointSize: 2,
    data: CESIUM_CONFIG.tilesetUrl,
    loader: CesiumIonLoader,
    loadOptions: {
      "cesium-ion": {
        accessToken: CESIUM_CONFIG.token,
      },
    },
    onTilesetLoad(tile) {
      const { cartographicCenter } = tile;
      if (cartographicCenter) {
        mapRef.current?.flyTo({
          center: [cartographicCenter[0], cartographicCenter[1]],
          zoom: 19,
          bearing: -80,
          pitch: 80,
        });
        setLoading(false);
      }
    },
  });
  return (
    <Map
      mapLib={maplibregl}
      mapStyle={mapStyle}
      initialViewState={INITIAL_VIEW_STATE}
      style={{ width: "100vw", height: "100vh" }}
      ref={mapRef}
    >
      <DeckGLOverlay layers={[layer3D]} />
      <NavigationControl />
      {loading ? (
        <span className="absolute top-2 left-2 z-[9999] w-24 h-24">
          <Loading />
        </span>
      ) : undefined}
    </Map>
  );
}
