import React, { useState, useEffect } from 'react';

const DataList = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/app/Product/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => setData(data))
            .catch(error => setError(error));
    }, []);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <h1>Your Data</h1>
            <ul>
                {data.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default DataList;
