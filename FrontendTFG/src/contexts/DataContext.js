import React, { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    steps: [],
    sleep: [],
    hydration: [],
  });
  const [loading, setLoading] = useState(true);

  // Simulación de carga de datos (puede sustituirse por una llamada a una API o AsyncStorage)
  useEffect(() => {
    const fetchData = async () => {
      // Simulamos un retardo para obtener datos
      setTimeout(() => {
        setData({
          steps: [8000, 9000, 10000, 7500, 11000, 9500, 12000],
          sleep: [7, 7.5, 8, 6, 7, 7, 8],
          hydration: [1.5, 2.0, 1.8, 1.6, 2.1, 1.9, 2.0],
        });
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ data, setData, loading }}>
      {children}
    </DataContext.Provider>
  );
};
