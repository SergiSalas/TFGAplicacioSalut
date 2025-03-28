import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let database = null;

export const initDB = async () => {
  try {
    database = await SQLite.openDatabase({
      name: 'fitnessapp.db',
      location: 'default'
    });
    
    // Crear tablas
    await database.executeSql(
      `CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        external_id TEXT,
        type TEXT,
        duration INTEGER,
        date TEXT,
        description TEXT,
        origin TEXT,
        data TEXT,
        created_at INTEGER
      )`
    );
    
    await database.executeSql(
      `CREATE TABLE IF NOT EXISTS saved_ids (
        id TEXT PRIMARY KEY,
        type TEXT,
        saved_at INTEGER
      )`
    );
    
    console.log('Base de datos inicializada');
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    return false;
  }
};

export const ActivityDatabase = {
  saveActivities: async (activities, date = null) => {
    if (!database) await initDB();
    
    try {
      await database.transaction(async (tx) => {
        // Usar una consulta parameterizada para cada actividad
        for (const activity of activities) {
          await tx.executeSql(
            `INSERT OR REPLACE INTO activities 
            (id, external_id, type, duration, date, description, origin, data, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              activity.id || `${Date.now()}-${Math.random()}`,
              activity.externalId || null,
              activity.type,
              activity.duration || 0,
              activity.date,
              activity.description,
              activity.origin || 'manual',
              JSON.stringify(activity),
              Date.now()
            ]
          );
        }
      });
      
      console.log(`Guardadas ${activities.length} actividades en la base de datos`);
      return true;
    } catch (error) {
      console.error('Error al guardar actividades:', error);
      return false;
    }
  },
  
  getActivities: async (date = null) => {
    if (!database) await initDB();
    
    try {
      let query = 'SELECT * FROM activities';
      const params = [];
      
      if (date) {
        // Consulta por fecha (formato YYYY-MM-DD)
        query += " WHERE date LIKE ?";
        params.push(`${date}%`);
      }
      
      query += ' ORDER BY date DESC';
      
      const [results] = await database.executeSql(query, params);
      const activities = [];
      
      for (let i = 0; i < results.rows.length; i++) {
        activities.push(results.rows.item(i));
      }
      
      console.log(`Recuperadas ${activities.length} actividades de la base de datos`);
      return activities;
    } catch (error) {
      console.error('Error al recuperar actividades:', error);
      return [];
    }
  },
  
  // Funciones adicionales...
}; 