// React component for searching resources
// include input field
// call onSearch callback when text changes
// send search keyword to parent component

import React from "react";

interface Props {
  onSearch: (keyword: string) => void;
}

const ResourceSearch: React.FC<Props> = ({ onSearch }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search resources..."
        onChange={handleChange}
      />
    </div>
  );
};

export default ResourceSearch;
