const API_BASE = '/api'

export const zoneApi = {
  // Get all zones data
  getZones: () => fetch(`${API_BASE}/zones`).then(res => {
    if (!res.ok) throw new Error('Failed to fetch zones')
    return res.json()
  }),

  // Start a disaster simulation in a zone
  startSimulation: (zoneId, disasterType) => 
    fetch(`${API_BASE}/simulations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zoneId, disasterType })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to start simulation')
      return res.json()
    }),

  // Get simulation results for a zone
  getSimulationResults: (simulationId) => 
    fetch(`${API_BASE}/simulations/${simulationId}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch results')
      return res.json()
    }),

  // Reset simulation for a zone
  resetSimulation: (zoneId) => 
    fetch(`${API_BASE}/simulations/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zoneId })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to reset simulation')
      return res.json()
    })
}