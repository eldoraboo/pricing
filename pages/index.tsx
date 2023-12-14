// pages/index.tsx

import { useEffect, useState } from "react";

interface ParsedData {
  [key: string]: number;
}

const IndexPage = () => {
  const [tableData, setTableData] = useState<ParsedData | null>(null);

  useEffect(() => {
    // Fetch data from the Next.js API route
    fetch("/api/euweeklyfr") // Replace 'your-api-endpoint' with the actual API endpoint
      .then((response) => response.json())
      .then((data) => setTableData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h1>EU Weekly (France)</h1>
      {tableData && (
        <table border={1}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tableData).map(([category, value]) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default IndexPage;
