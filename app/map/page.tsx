import MapWrapper from "@/components/map/map-wrapper";
import { ErrorBoundary } from "@/components/error-boundary";

export default function MapPage() {
  return (
    <ErrorBoundary>
      <MapWrapper />
    </ErrorBoundary>
  );
}
