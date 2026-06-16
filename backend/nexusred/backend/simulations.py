from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

router = APIRouter()

# In-memory storage shared with main (imported later)
# This module will be imported by main.py which defines a global SIMULATIONS list.

class SimulationCreate(BaseModel):
    name: str
    description: str | None = None
    assets: List[str]
    techniques: List[str]

class Simulation(BaseModel):
    id: int
    status: str
    name: str
    assets: List[str]
    techniques: List[str]

@router.post('/', response_model=Simulation)
def create_simulation(sim: SimulationCreate):
    # Access the global list from main via fastapi Depends? Simpler: import from main after it's defined.
    from .main import SIMULATIONS  # noqa: E402
    sim_id = len(SIMULATIONS) + 1
    new = {
        'id': sim_id,
        'status': 'running',
        'name': sim.name,
        'assets': sim.assets,
        'techniques': sim.techniques,
    }
    SIMULATIONS.append(new)
    return new

@router.get('/{sim_id}', response_model=Simulation)
def get_simulation(sim_id: int):
    from .main import SIMULATIONS  # noqa: E402
    for s in SIMULATIONS:
        if s['id'] == sim_id:
            return s
    raise HTTPException(status_code=404, detail='Simulation not found')

@router.get('/', response_model=List[Simulation])
def list_simulations():
    from .main import SIMULATIONS  # noqa: E402
    return SIMULATIONS
