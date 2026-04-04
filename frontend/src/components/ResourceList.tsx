// React component that fetches resources from resourceService
// display them in a table
// show columns: name, type, capacity, location, status
// call getResources() when component loads

import { useEffect, useState } from "react";
import { getResources } from "../services/resourceService";
import type { Resource } from "../services/resourceService";
import ResourceSearch from "./ResourceSearch";

const ResourceList = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadResources();
  }, []);

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

  const filteredResources = resources.filter((resource) =>
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
