// React component that fetches resources from resourceService
// display them in a table
// show columns: name, type, capacity, location, status
// call getResources() when component loads
// REAL-TIME: Subscribe to WebSocket for live updates

import { useEffect, useState } from "react";
import { getResources } from "../services/resourceService";
import type { Resource } from "../services/resourceService";
import webSocketService from "../services/webSocketService";
import type { ResourceEvent } from "../services/webSocketService";
import ResourceSearch from "./ResourceSearch";

const ResourceList = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Load initial resources
    loadResources();

    // Connect to WebSocket
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const connectWebSocket = async () => {
    try {
      await webSocketService.connect();

      // Subscribe to resource events
      const unsubscribe = webSocketService.subscribe(handleResourceEvent);

      return unsubscribe;
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
    }
  };

  const handleResourceEvent = (event: ResourceEvent) => {
    setResources((prevResources) => {
      if (event.action === "CREATE") {
        // Add new resource (reload to get full details)
        loadResources();
        return prevResources;
      } else if (event.action === "UPDATE") {
        // Update existing resource (reload to get fresh data)
        loadResources();
        return prevResources;
      } else if (event.action === "DELETE") {
        // Remove deleted resource
        return prevResources.filter((r) => r.id !== event.resourceId);
      }
      return prevResources;
    });
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await getResources();
      setResources(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load resources");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Resources</h2>
      <ResourceSearch onSearch={setSearchTerm} />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Capacity</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredResources.map((resource) => (
            <tr key={resource.id}>
              <td>{resource.name}</td>
              <td>{resource.type}</td>
              <td>{resource.capacity}</td>
              <td>{resource.location}</td>
              <td>{resource.status === "ACTIVE" ? "Available" : "Unavailable"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourceList;
