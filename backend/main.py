import os
import json
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from sqlmodel import Session, select

from database import init_db, get_session
from models import Simulation, Evidence, User, Tenant
from auth import (
    create_access_token,
    get_current_user,
    verify_password,
    get_password_hash,
)

app = FastAPI(title='NexusRed Backend')

# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event('startup')
def on_startup():
    init_db()

# ---------------------------------------------------------------------------
# Pydantic request / response models
# ---------------------------------------------------------------------------
class SimulationRequest(BaseModel):
    name: str
    description: Optional[str] = None
    assets: List[str]
    techniques: List[str]
    tenant_id: int

class SimulationResponse(BaseModel):
    id: int
    status: str
    name: str
    assets: List[str]
    techniques: List[str]

class EvidenceItem(BaseModel):
    technique: str
    raw_log: str
    sigma_rule: str
    timestamp: str

class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'

# ---------------------------------------------------------------------------
# Helper JSON (de)serialization for lists stored as TEXT
# ---------------------------------------------------------------------------
def _json_encode(lst: List[str]) -> str:
    return json.dumps(lst)

def _json_decode(txt: str) -> List[str]:
    return json.loads(txt)

# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@app.post('/token', response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid credentials')
    access_token = create_access_token(data={'sub': user.username, 'role': user.role, 'tenant_id': user.tenant_id})
    return Token(access_token=access_token)

# ---------------------------------------------------------------------------
# Tenant / User management (admin only)
# ---------------------------------------------------------------------------
@app.post('/tenants', status_code=201)
def create_tenant(name: str, plan: str = 'starter', current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail='Only admin can create tenants')
    tenant = Tenant(name=name)
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    return {'id': tenant.id, 'name': tenant.name, 'plan': plan}

@app.post('/users', status_code=201)
def create_user(username: str, password: str, role: str = 'red', tenant_id: int = None, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail='Only admin can create users')
    if tenant_id is None:
        tenant_id = current_user.tenant_id
    hashed = get_password_hash(password)
    user = User(username=username, hashed_password=hashed, role=role, tenant_id=tenant_id)
    session.add(user)
    session.commit()
    session.refresh(user)
    return {'id': user.id, 'username': user.username, 'role': user.role, 'tenant_id': user.tenant_id}

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get('/health')
def health():
    # Use the session factory directly as a context manager.
    # get_session() returns a Session instance which can be used with "with".
    with get_session() as sess:
        running = sess.exec(select(Simulation).where(Simulation.status == 'running')).all()
    return {
        'status': 'ok',
        'running_simulations': len(running),
        'coverage_score': 0,
        'avg_tte': 0,
    }

# ---------------------------------------------------------------------------
# Simulation endpoints (protected)
# ---------------------------------------------------------------------------
@app.post('/simulations', response_model=SimulationResponse)
def create_simulation(req: SimulationRequest, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # Enforce tenant isolation
    if req.tenant_id != current_user.tenant_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail='Cannot create simulation for another tenant')
    sim = Simulation(
        name=req.name,
        description=req.description,
        assets=_json_encode(req.assets),
        techniques=_json_encode(req.techniques),
        status='running',
        tenant_id=req.tenant_id,
    )
    session.add(sim)
    session.commit()
    session.refresh(sim)
    # mock evidence
    for tech in req.techniques:
        ev = Evidence(
            simulation_id=sim.id,
            technique=tech,
            raw_log=f'Executed mock {tech} on assets {", ".join(req.assets)}',
            sigma_rule=f'sigma_{tech.lower()}',
        )
        session.add(ev)
    sim.status = 'completed'
    session.add(sim)
    session.commit()
    return SimulationResponse(
        id=sim.id,
        status=sim.status,
        name=sim.name,
        assets=req.assets,
        techniques=req.techniques,
    )

@app.get('/simulations/{sim_id}', response_model=SimulationResponse)
def get_simulation(sim_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    sim = session.get(Simulation, sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail='Simulation not found')
    if sim.tenant_id != current_user.tenant_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail='Access denied')
    return SimulationResponse(
        id=sim.id,
        status=sim.status,
        name=sim.name,
        assets=_json_decode(sim.assets),
        techniques=_json_decode(sim.techniques),
    )

@app.get('/simulations', response_model=List[SimulationResponse])
def list_simulations(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    stmt = select(Simulation)
    if current_user.role != 'admin':
        stmt = stmt.where(Simulation.tenant_id == current_user.tenant_id)
    sims = session.exec(stmt).all()
    return [
        SimulationResponse(
            id=s.id,
            status=s.status,
            name=s.name,
            assets=_json_decode(s.assets),
            techniques=_json_decode(s.techniques),
        )
        for s in sims
    ]

@app.get('/evidence/{sim_id}', response_model=List[EvidenceItem])
def get_evidence(sim_id: int, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    sim = session.get(Simulation, sim_id)
    if not sim:
        raise HTTPException(status_code=404, detail='Simulation not found')
    if sim.tenant_id != current_user.tenant_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail='Access denied')
    evs = session.exec(select(Evidence).where(Evidence.simulation_id == sim_id)).all()
    return [
        EvidenceItem(
            technique=e.technique,
            raw_log=e.raw_log,
            sigma_rule=e.sigma_rule,
            timestamp=e.timestamp.isoformat(),
        )
        for e in evs
    ]

# ---------------------------------------------------------------------------
# Exposure Intelligence (mock, replace later)
# ---------------------------------------------------------------------------
@app.get('/exposure/search')
def exposure_search(q: str = Query(..., description='Search term (email, username, etc.)')):
    return [{
        'indicator': q,
        'sources': ['HaveIBeenPwned', 'SpyCloud'],
        'last_seen': '2024-06-10',
        'confidence': 'high',
        'risk_score': 9,
    }]
